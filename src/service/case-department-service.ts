import { prismaEmployee, prismaFlowly } from "../application/database.js";
import { logger } from "../application/logging.js";
import { Validation } from "../validation/validation.js";
import { CaseDepartmentValidation } from "../validation/case-department-validation.js";
import { ResponseError } from "../error/response-error.js";
import {
  generateCaseDepartmentAssigneeId,
  generateCaseDepartmentId,
} from "../utils/id-generator.js";
import {
  buildChanges,
  pickSnapshot,
  resolveActorType,
  writeAuditLog,
} from "../utils/audit-log.js";
import {
  assertCaseCrud,
  assertCaseRead,
  ensureCaseNotClosed,
  getEmployeeChartSbuSubIds,
  resolveCaseAccess,
  canEmployeeViewCase,
  isPicForSbuSub,
  isAssigneeForCase,
  isAssigneeForDepartment,
} from "../utils/case-access.js";
import {
  CASE_DECISION_STATUSES,
  CASE_WORK_STATUSES,
  normalizeUpper,
} from "../utils/case-constants.js";
import type { Prisma } from "../generated/flowly/client.js";
import {
  type CreateCaseDepartmentRequest,
  type UpdateCaseDepartmentRequest,
  type DeleteCaseDepartmentRequest,
  toCaseDepartmentResponse,
  toCaseDepartmentListResponse,
} from "../model/case-department-model.js";
import { CaseNotificationService } from "./case-notification-service.js";

const CASE_DEPARTMENT_FIELDS = [
  "caseId",
  "sbuSubId",
  "decisionStatus",
  "decisionAt",
  "decisionBy",
  "decisionNotes",
  "assigneeEmployeeId",
  "assignedAt",
  "assignedBy",
  "workStatus",
  "startDate",
  "targetDate",
  "endDate",
  "workNotes",
  "isActive",
  "isDeleted",
] as const;

const getDepartmentSnapshot = (record: Record<string, unknown>) =>
  pickSnapshot(record, CASE_DEPARTMENT_FIELDS as unknown as string[]);

const parseDate = (value: string | Date | null) => {
  if (value === null) return null;
  if (value instanceof Date) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new ResponseError(400, "Invalid date format");
  }
  return parsed;
};

const normalizeNotes = (value: string | null) => {
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const normalizeAssigneeIds = (value?: number[] | null) => {
  if (!value) return [];
  const filtered = value
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item) && item > 0);
  return Array.from(new Set(filtered));
};

const resolveAssigneeIdsFromRequest = (
  request: UpdateCaseDepartmentRequest
) => {
  if (request.assigneeEmployeeIds !== undefined) {
    return normalizeAssigneeIds(request.assigneeEmployeeIds);
  }
  if (request.assigneeEmployeeId !== undefined) {
    return request.assigneeEmployeeId ? [request.assigneeEmployeeId] : [];
  }
  return undefined;
};

const ensureDecisionStatus = (value: string) => {
  const normalized = normalizeUpper(value);
  if (
    !CASE_DECISION_STATUSES.includes(
      normalized as (typeof CASE_DECISION_STATUSES)[number]
    )
  ) {
    throw new ResponseError(400, "Invalid decisionStatus");
  }
  return normalized;
};

const ensureWorkStatus = (value: string) => {
  const normalized = normalizeUpper(value);
  if (
    !CASE_WORK_STATUSES.includes(
      normalized as (typeof CASE_WORK_STATUSES)[number]
    )
  ) {
    throw new ResponseError(400, "Invalid workStatus");
  }
  return normalized;
};

const ensureSbuSubExists = async (sbuSubId: number) => {
  const sbuSub = await prismaEmployee.em_sbu_sub.findFirst({
    where: {
      id: sbuSubId,
      status: "A",
      OR: [{ isDeleted: false }, { isDeleted: null }],
    },
    select: { id: true },
  });

  if (!sbuSub) {
    throw new ResponseError(400, "Invalid SBU Sub");
  }
};

const getAllowedAssigneeEmployeeIds = async (sbuSubId: number) => {
  const sbuSub = await prismaEmployee.em_sbu_sub.findFirst({
    where: {
      id: sbuSubId,
      status: "A",
      OR: [{ isDeleted: false }, { isDeleted: null }],
    },
    select: {
      id: true,
      sbu_id: true,
      sbu_pilar: true,
      pic: true,
    },
  });

  if (!sbuSub) {
    return [];
  }

  const chartNodes = await prismaFlowly.chart.findMany({
    where: {
      sbuSubId,
      isDeleted: false,
    },
    select: { chartId: true },
  });
  const chartIds = chartNodes.map((item) => item.chartId);

  const [sbu, pilar, chartMembers] = await Promise.all([
    sbuSub.sbu_id
      ? prismaEmployee.em_sbu.findFirst({
          where: {
            id: sbuSub.sbu_id,
            status: "A",
            OR: [{ isDeleted: false }, { isDeleted: null }],
          },
          select: { pic: true },
        })
      : Promise.resolve(null),
    sbuSub.sbu_pilar
      ? prismaEmployee.em_pilar.findFirst({
          where: {
            id: sbuSub.sbu_pilar,
            status: "A",
            OR: [{ isDeleted: false }, { isDeleted: null }],
          },
          select: { pic: true },
        })
      : Promise.resolve(null),
    chartIds.length > 0
      ? prismaFlowly.chartMember.findMany({
          where: {
            chartId: { in: chartIds },
            isDeleted: false,
            userId: { not: null },
          },
          select: { userId: true },
        })
      : Promise.resolve([]),
  ]);

  const allowedEmployeeIds = new Set<number>();

  for (const member of chartMembers) {
    if (typeof member.userId === "number" && member.userId > 0) {
      allowedEmployeeIds.add(member.userId);
    }
  }

  for (const picId of [sbuSub.pic, sbu?.pic ?? null, pilar?.pic ?? null]) {
    if (typeof picId === "number" && picId > 0) {
      allowedEmployeeIds.add(picId);
    }
  }

  return Array.from(allowedEmployeeIds).sort((left, right) => left - right);
};

const ensureEmployeesAssignableForSbuSub = async (
  employeeIds: number[],
  sbuSubId: number
) => {
  if (employeeIds.length === 0) {
    return;
  }

  const [employees, allowedAssigneeIds] = await Promise.all([
    prismaEmployee.em_employee.findMany({
      where: { UserId: { in: employeeIds } },
      select: { UserId: true },
    }),
    getAllowedAssigneeEmployeeIds(sbuSubId),
  ]);

  const employeeSet = new Set(employees.map((item) => item.UserId));
  const missingEmployeeId = employeeIds.find((id) => !employeeSet.has(id));
  if (missingEmployeeId !== undefined) {
    throw new ResponseError(404, `Employee not found: ${missingEmployeeId}`);
  }

  const allowedAssigneeSet = new Set(allowedAssigneeIds);
  const invalidEmployeeId = employeeIds.find((id) => !allowedAssigneeSet.has(id));
  if (invalidEmployeeId !== undefined) {
    throw new ResponseError(
      400,
      "Employee is outside the allowed SBU Sub assignment scope"
    );
  }
};

const syncCaseHeaderStatus = async (caseId: string, requesterId: string) => {
  const [caseHeader, departments] = await Promise.all([
    prismaFlowly.caseHeader.findUnique({
      where: { caseId },
      select: { status: true, isDeleted: true },
    }),
    prismaFlowly.caseDepartment.findMany({
      where: { caseId, isDeleted: false },
      select: { decisionStatus: true, workStatus: true },
    }),
  ]);

  if (!caseHeader || caseHeader.isDeleted) return;
  if (departments.length === 0) return;

  const decisions = departments.map((dept) => dept.decisionStatus);
  const allRejected = decisions.every((value) => value === "REJECT");
  const anyPending = decisions.some((value) => value === "PENDING");
  const accepted = departments.filter((dept) => dept.decisionStatus === "ACCEPT");
  const anyAccepted = accepted.length > 0;
  const anyInProgress = departments.some(
    (dept) => dept.workStatus === "IN_PROGRESS"
  );
  const allAcceptedDone =
    accepted.length > 0 &&
    accepted.every((dept) => dept.workStatus === "DONE");

  let nextStatus = "NEW";
  if (allRejected) {
    nextStatus = "CANCEL";
  } else if (anyInProgress) {
    nextStatus = "IN_PROGRESS";
  } else if (allAcceptedDone) {
    nextStatus = "DONE";
  } else if (anyAccepted || anyPending) {
    nextStatus = "PENDING";
  }

  if (caseHeader.status === nextStatus) return;

  await prismaFlowly.caseHeader.update({
    where: { caseId },
    data: {
      status: nextStatus,
      updatedAt: new Date(),
      updatedBy: requesterId,
    },
  });
};

export class CaseDepartmentService {
  static async create(requesterId: string, reqBody: CreateCaseDepartmentRequest) {
    const request = Validation.validate(CaseDepartmentValidation.CREATE, reqBody);

    const access = await resolveCaseAccess(requesterId);
    if (access.actorType === "FLOWLY") {
      assertCaseCrud(access);
    }

    const caseHeader = await prismaFlowly.caseHeader.findUnique({
      where: { caseId: request.caseId },
      select: { caseId: true, isDeleted: true, requesterEmployeeId: true },
    });

    if (!caseHeader || caseHeader.isDeleted) {
      throw new ResponseError(404, "Case not found");
    }

    await ensureCaseNotClosed(caseHeader.caseId);

    if (access.actorType === "EMPLOYEE" && access.employeeId !== undefined) {
      const employeeId = access.employeeId;
      const isRequester = caseHeader.requesterEmployeeId === employeeId;

      if (!isRequester) {
        const departments = await prismaFlowly.caseDepartment.findMany({
          where: { caseId: request.caseId, isDeleted: false },
          select: { sbuSubId: true },
        });

        const isAssignee = await isAssigneeForCase(employeeId, request.caseId);

        let isPic = false;
        if (!isAssignee && departments.length > 0) {
          const sbuSubIds = Array.from(
            new Set(departments.map((dept) => dept.sbuSubId))
          );
          const pic = await prismaEmployee.em_sbu_sub.findFirst({
            where: {
              id: { in: sbuSubIds },
              pic: employeeId,
              status: "A",
              OR: [{ isDeleted: false }, { isDeleted: null }],
            },
            select: { id: true },
          });
          isPic = Boolean(pic);
        }

        if (!isAssignee && !isPic) {
          throw new ResponseError(
            403,
            "Only requester, PIC, or assignee can add department"
          );
        }
      }
    }

    await ensureSbuSubExists(request.sbuSubId);

    const existing = await prismaFlowly.caseDepartment.findFirst({
      where: { caseId: request.caseId, sbuSubId: request.sbuSubId },
      select: { caseDepartmentId: true },
    });

    if (existing) {
      throw new ResponseError(400, "Department already exists in case");
    }

    const createId = await generateCaseDepartmentId();
    const now = new Date();

    const created = await prismaFlowly.caseDepartment.create({
      data: {
        caseDepartmentId: createId(),
        caseId: request.caseId,
        sbuSubId: request.sbuSubId,
        decisionStatus: "PENDING",
        isActive: true,
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
        createdBy: requesterId,
        updatedBy: requesterId,
      },
    });

    await writeAuditLog({
      module: "CASE",
      entity: "CASE_DEPARTMENT",
      entityId: created.caseDepartmentId,
      action: "CREATE",
      actorId: requesterId,
      actorType: access.actorType,
      snapshot: getDepartmentSnapshot(created as unknown as Record<string, unknown>),
      meta: { caseId: created.caseId },
    });

    await syncCaseHeaderStatus(created.caseId, requesterId);

    try {
      await CaseNotificationService.enqueueDepartmentAddedNotification({
        caseId: created.caseId,
        caseDepartmentId: created.caseDepartmentId,
        sbuSubId: created.sbuSubId,
        requesterId,
      });
    } catch (error) {
      logger.warn("Failed to enqueue case add-department notification", {
        caseDepartmentId: created.caseDepartmentId,
        error: (error as Error)?.message ?? error,
      });
    }

    return toCaseDepartmentResponse(created);
  }

  static async update(
    requesterId: string,
    reqBody: UpdateCaseDepartmentRequest
  ) {
    const request = Validation.validate(CaseDepartmentValidation.UPDATE, reqBody);

    const access = await resolveCaseAccess(requesterId);
    if (access.actorType === "FLOWLY") {
      assertCaseCrud(access);
    }

    const existing = await prismaFlowly.caseDepartment.findUnique({
      where: { caseDepartmentId: request.caseDepartmentId },
    });

    if (!existing || existing.isDeleted) {
      throw new ResponseError(404, "Case department not found");
    }

    await ensureCaseNotClosed(existing.caseId);
    let requestedAssigneeIds = resolveAssigneeIdsFromRequest(request);

    if (access.actorType === "EMPLOYEE") {
      if (access.employeeId === undefined) {
        throw new ResponseError(401, "Unauthorized");
      }
      const employeeId = access.employeeId;
      const isPic = await isPicForSbuSub(employeeId, existing.sbuSubId);
      const isAssignee = await isAssigneeForDepartment(
        employeeId,
        existing.caseDepartmentId
      );

      const hasDecisionUpdate =
        request.decisionStatus !== undefined || request.decisionNotes !== undefined;
      const hasAssignmentUpdate = requestedAssigneeIds !== undefined;
      const hasWorkUpdate =
        request.workStatus !== undefined ||
        request.startDate !== undefined ||
        request.targetDate !== undefined ||
        request.endDate !== undefined ||
        request.workNotes !== undefined;

      if (hasDecisionUpdate && !isPic) {
        throw new ResponseError(403, "Only PIC can update decision");
      }
      if (hasAssignmentUpdate && !isPic) {
        throw new ResponseError(403, "Only PIC can assign assignee");
      }
      if (hasWorkUpdate && !isPic && !isAssignee) {
        throw new ResponseError(403, "Only assignee or PIC can update work status");
      }
    }

    const nextDecisionStatus =
      request.decisionStatus !== undefined
        ? ensureDecisionStatus(request.decisionStatus)
        : existing.decisionStatus;
    const existingDecisionNotes = normalizeNotes(existing.decisionNotes ?? null);
    const nextDecisionNotes =
      request.decisionNotes !== undefined
        ? normalizeNotes(request.decisionNotes)
        : existingDecisionNotes;
    const shouldNotifyDecision =
      request.decisionStatus !== undefined &&
      nextDecisionStatus !== existing.decisionStatus &&
      (nextDecisionStatus === "ACCEPT" || nextDecisionStatus === "REJECT");

    const nextWorkStatus =
      request.workStatus !== undefined
        ? request.workStatus === null
          ? null
          : ensureWorkStatus(request.workStatus)
        : existing.workStatus;

    let hasAssignmentUpdate = requestedAssigneeIds !== undefined;
    const hasWorkUpdate =
      request.workStatus !== undefined ||
      request.startDate !== undefined ||
      request.targetDate !== undefined ||
      request.endDate !== undefined ||
      request.workNotes !== undefined;

    if (request.decisionStatus !== undefined && nextDecisionStatus === "REJECT") {
      requestedAssigneeIds = [];
      hasAssignmentUpdate = true;
    }

    if ((hasAssignmentUpdate || hasWorkUpdate) && nextDecisionStatus !== "ACCEPT") {
      if (!(request.decisionStatus && nextDecisionStatus === "REJECT")) {
        throw new ResponseError(400, "Case must be accepted before assignment");
      }
    }

    if (nextDecisionStatus === "REJECT" && !nextDecisionNotes) {
      throw new ResponseError(400, "Komentar wajib diisi sebelum REJECT");
    }

    if (hasAssignmentUpdate && requestedAssigneeIds) {
      await ensureEmployeesAssignableForSbuSub(
        requestedAssigneeIds,
        existing.sbuSubId
      );
    }

    const before = { ...existing } as Record<string, unknown>;
    const now = new Date();

    const updateData: Prisma.CaseDepartmentUpdateInput = {
      workStatus: nextWorkStatus,
      startDate:
        request.startDate !== undefined
          ? parseDate(request.startDate)
          : existing.startDate,
      targetDate:
        request.targetDate !== undefined
          ? parseDate(request.targetDate)
          : existing.targetDate,
      endDate:
        request.endDate !== undefined
          ? parseDate(request.endDate)
          : existing.endDate,
      workNotes:
        request.workNotes !== undefined ? request.workNotes : existing.workNotes,
      isActive: request.isActive ?? existing.isActive,
      updatedAt: now,
      updatedBy: requesterId,
    };

    if (request.decisionStatus !== undefined || request.decisionNotes !== undefined) {
      if (request.decisionStatus !== undefined) {
        updateData.decisionStatus = nextDecisionStatus;
      }
      if (request.decisionNotes !== undefined) {
        updateData.decisionNotes = nextDecisionNotes;
      }
      updateData.decisionAt = now;
      updateData.decisionBy = requesterId;
    }

    if (requestedAssigneeIds !== undefined) {
      const primaryAssignee: number | null = requestedAssigneeIds[0] ?? null;
      updateData.assigneeEmployeeId = primaryAssignee;
      updateData.assignedAt = primaryAssignee ? now : null;
      updateData.assignedBy = primaryAssignee ? requesterId : null;
    }

    if (request.decisionStatus !== undefined && nextDecisionStatus === "REJECT") {
      updateData.workStatus = null;
      updateData.startDate = null;
      updateData.targetDate = null;
      updateData.endDate = null;
      updateData.workNotes = null;
    }

    const createAssigneeId =
      requestedAssigneeIds !== undefined
        ? await generateCaseDepartmentAssigneeId()
        : null;

    const result = await prismaFlowly.$transaction(async (tx) => {
      const updated = await tx.caseDepartment.update({
        where: { caseDepartmentId: request.caseDepartmentId },
        data: updateData,
      });

      let addedAssigneeIds: number[] = [];

      if (requestedAssigneeIds !== undefined) {
        const assigneeClient = tx as typeof tx & {
          caseDepartmentAssignee: {
            findMany: (args: any) => Promise<
              Array<{
                caseDepartmentAssigneeId: string;
                employeeId: number;
                isDeleted: boolean;
              }>
            >;
            update: (args: any) => Promise<any>;
            create: (args: any) => Promise<any>;
          };
        };

        const existingAssignees =
          await assigneeClient.caseDepartmentAssignee.findMany({
            where: { caseDepartmentId: existing.caseDepartmentId },
            select: {
              caseDepartmentAssigneeId: true,
              employeeId: true,
              isDeleted: true,
            },
          });

        const existingActiveIds = new Set(
          existingAssignees
            .filter((item) => !item.isDeleted)
            .map((item) => item.employeeId)
        );
        const nextIds = new Set(requestedAssigneeIds);
        const assigneeMap = new Map(
          existingAssignees.map((item) => [item.employeeId, item])
        );

        const removedIds = Array.from(existingActiveIds).filter(
          (id) => !nextIds.has(id)
        );
        addedAssigneeIds = Array.from(nextIds).filter(
          (id) => !existingActiveIds.has(id)
        );

        const updates: Promise<unknown>[] = [];

        for (const employeeId of removedIds) {
          const record = assigneeMap.get(employeeId);
          if (!record) continue;
          updates.push(
            assigneeClient.caseDepartmentAssignee.update({
              where: { caseDepartmentAssigneeId: record.caseDepartmentAssigneeId },
              data: {
                isDeleted: true,
                isActive: false,
                deletedAt: now,
                deletedBy: requesterId,
                updatedAt: now,
                updatedBy: requesterId,
              },
            })
          );
        }

        for (const employeeId of addedAssigneeIds) {
          const record = assigneeMap.get(employeeId);
          if (record) {
            updates.push(
              assigneeClient.caseDepartmentAssignee.update({
                where: { caseDepartmentAssigneeId: record.caseDepartmentAssigneeId },
                data: {
                  isDeleted: false,
                  isActive: true,
                  deletedAt: null,
                  deletedBy: null,
                  assignedAt: now,
                  assignedBy: requesterId,
                  updatedAt: now,
                  updatedBy: requesterId,
                },
              })
            );
          } else if (createAssigneeId) {
            updates.push(
              assigneeClient.caseDepartmentAssignee.create({
                data: {
                  caseDepartmentAssigneeId: createAssigneeId(),
                  caseDepartmentId: existing.caseDepartmentId,
                  employeeId,
                  assignedAt: now,
                  assignedBy: requesterId,
                  isActive: true,
                  isDeleted: false,
                  createdAt: now,
                  updatedAt: now,
                  createdBy: requesterId,
                  updatedBy: requesterId,
                },
              })
            );
          }
        }

        if (updates.length > 0) {
          await Promise.all(updates);
        }
      }

      const updatedWithAssignees = await (tx as typeof tx & {
        caseDepartment: {
          findUnique: (args: any) => Promise<any>;
        };
      }).caseDepartment.findUnique({
        where: { caseDepartmentId: updated.caseDepartmentId },
        include: {
          assignees: { where: { isDeleted: false } },
        },
      });

      return {
        updated: updatedWithAssignees ?? updated,
        addedAssigneeIds,
      };
    });

    const updated = result.updated;
    const addedAssigneeIds = result.addedAssigneeIds;

    const changes = buildChanges(
      before,
      updated as unknown as Record<string, unknown>,
      CASE_DEPARTMENT_FIELDS as unknown as string[]
    );

    if (changes.length > 0) {
      await writeAuditLog({
        module: "CASE",
        entity: "CASE_DEPARTMENT",
        entityId: updated.caseDepartmentId,
        action: "UPDATE",
        actorId: requesterId,
        actorType: resolveActorType(requesterId),
        changes,
        meta: { caseId: updated.caseId },
      });
    }

    if (addedAssigneeIds.length > 0) {
      try {
        await CaseNotificationService.enqueueAssigneeNotifications({
          caseId: updated.caseId,
          caseDepartmentId: updated.caseDepartmentId,
          sbuSubId: updated.sbuSubId,
          assigneeEmployeeIds: addedAssigneeIds,
          requesterId,
        });
      } catch (error) {
        logger.warn("Failed to enqueue case assignee notifications", {
          caseDepartmentId: updated.caseDepartmentId,
          error: (error as Error)?.message ?? error,
        });
      }
    }

    if (shouldNotifyDecision) {
      try {
        await CaseNotificationService.enqueueRequesterDecisionNotification({
          caseId: updated.caseId,
          caseDepartmentId: updated.caseDepartmentId,
          requesterId,
        });
      } catch (error) {
        logger.warn("Failed to enqueue case decision notification", {
          caseDepartmentId: updated.caseDepartmentId,
          error: (error as Error)?.message ?? error,
        });
      }
    }

    await syncCaseHeaderStatus(updated.caseId, requesterId);

    return toCaseDepartmentResponse(updated);
  }

  static async softDelete(
    requesterId: string,
    reqBody: DeleteCaseDepartmentRequest
  ) {
    const request = Validation.validate(CaseDepartmentValidation.DELETE, reqBody);

    const access = await resolveCaseAccess(requesterId);
    if (access.actorType === "FLOWLY") {
      assertCaseCrud(access);
    }

    const existing = await prismaFlowly.caseDepartment.findUnique({
      where: { caseDepartmentId: request.caseDepartmentId },
    });

    if (!existing || existing.isDeleted) {
      throw new ResponseError(404, "Case department not found");
    }

    const now = new Date();
    const updated = await prismaFlowly.caseDepartment.update({
      where: { caseDepartmentId: request.caseDepartmentId },
      data: {
        isDeleted: true,
        isActive: false,
        deletedAt: now,
        deletedBy: requesterId,
        updatedAt: now,
        updatedBy: requesterId,
      },
    });

    await writeAuditLog({
      module: "CASE",
      entity: "CASE_DEPARTMENT",
      entityId: updated.caseDepartmentId,
      action: "DELETE",
      actorId: requesterId,
      actorType: resolveActorType(requesterId),
      snapshot: getDepartmentSnapshot(updated as unknown as Record<string, unknown>),
      meta: { caseId: updated.caseId },
    });

    await syncCaseHeaderStatus(updated.caseId, requesterId);

    return { message: "Case department deleted" };
  }

  static async list(
    requesterId: string,
    filters?: {
      caseId?: string;
      sbuSubId?: number;
      decisionStatus?: string;
      assigneeEmployeeId?: number;
    }
  ) {
    const access = await resolveCaseAccess(requesterId);
    if (access.actorType === "FLOWLY") {
      assertCaseRead(access);
    }

    const whereClause: Prisma.CaseDepartmentWhereInput = {
      isDeleted: false,
      ...(access.actorType === "FLOWLY" && !access.canCrud ? { isActive: true } : {}),
      ...(filters?.caseId ? { caseId: filters.caseId } : {}),
      ...(filters?.sbuSubId !== undefined ? { sbuSubId: filters.sbuSubId } : {}),
      ...(filters?.decisionStatus ? { decisionStatus: filters.decisionStatus } : {}),
      ...(filters?.assigneeEmployeeId !== undefined
        ? {
            OR: [
              {
                assignees: {
                  some: {
                    employeeId: filters.assigneeEmployeeId,
                    isDeleted: false,
                  },
                },
              },
              { assigneeEmployeeId: filters.assigneeEmployeeId },
            ],
          }
        : {}),
    };

    if (access.actorType === "EMPLOYEE" && access.employeeId !== undefined) {
      const employeeId = access.employeeId;
      if (filters?.caseId) {
        const canView = await canEmployeeViewCase(employeeId, filters.caseId);
        if (!canView) return [];
      } else {
        const picSubs = await prismaEmployee.em_sbu_sub.findMany({
          where: {
            pic: employeeId,
            status: "A",
            OR: [{ isDeleted: false }, { isDeleted: null }],
          },
          select: { id: true },
        });
        const picSbuSubIds = picSubs.map((sub) => sub.id);
        const chartSbuSubIds = await getEmployeeChartSbuSubIds(employeeId);

        const orFilters: Prisma.CaseDepartmentWhereInput[] = [
          {
            assignees: {
              some: {
                employeeId,
                isDeleted: false,
              },
            },
          },
          { assigneeEmployeeId: employeeId },
          { case: { requesterEmployeeId: employeeId } },
          ...(picSbuSubIds.length > 0 ? [{ sbuSubId: { in: picSbuSubIds } }] : []),
        ];

        if (chartSbuSubIds.length > 0) {
          orFilters.push({
            case: {
              visibility: "PUBLIC",
              OR: [
                { originSbuSubId: { in: chartSbuSubIds } },
                {
                  departments: {
                    some: {
                      sbuSubId: { in: chartSbuSubIds },
                      isDeleted: false,
                    },
                  },
                },
              ],
            },
          } as Prisma.CaseDepartmentWhereInput);
        }

        whereClause.OR = orFilters;
      }
    }

    const list = await prismaFlowly.caseDepartment.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        assignees: { where: { isDeleted: false } },
      },
    });

    if (!filters?.caseId || list.length === 0) {
      return list.map(toCaseDepartmentListResponse);
    }

    const uniqueSbuSubIds = Array.from(new Set(list.map((item) => item.sbuSubId)));
    const assigneeScopeEntries = await Promise.all(
      uniqueSbuSubIds.map(async (sbuSubId) => [
        sbuSubId,
        await getAllowedAssigneeEmployeeIds(sbuSubId),
      ] as const)
    );
    const assigneeScopeMap = new Map(assigneeScopeEntries);

    return list.map((item) =>
      toCaseDepartmentListResponse({
        ...item,
        availableAssigneeEmployeeIds:
          assigneeScopeMap.get(item.sbuSubId) ?? [],
      })
    );
  }
}
