import { prismaEmployee, prismaFlowly } from "../application/database.js";
import { logger } from "../application/logging.js";
import { Validation } from "../validation/validation.js";
import { CaseHeaderValidation } from "../validation/case-header-validation.js";
import { ResponseError } from "../error/response-error.js";
import {
  generateCaseId,
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
  resolveCaseAccess,
  type CaseAccess,
} from "../utils/case-access.js";
import {
  CASE_STATUSES,
  CASE_TYPES,
  normalizeUpper,
} from "../utils/case-constants.js";
import type { Prisma } from "../generated/flowly/client.js";
import {
  type CreateCaseHeaderRequest,
  type UpdateCaseHeaderRequest,
  type DeleteCaseHeaderRequest,
  toCaseHeaderResponse,
  toCaseHeaderListResponse,
} from "../model/case-header-model.js";
import { CaseNotificationService } from "./case-notification-service.js";

const CASE_AUDIT_FIELDS = [
  "caseType",
  "caseTitle",
  "background",
  "currentCondition",
  "projectDesc",
  "projectObjective",
  "locationDesc",
  "notes",
  "status",
  "requesterId",
  "requesterEmployeeId",
  "originSbuSubId",
  "isActive",
  "isDeleted",
];

const getCaseSnapshot = (record: Record<string, unknown>) =>
  pickSnapshot(record, CASE_AUDIT_FIELDS as unknown as string[]);

const normalizeNullableText = (value?: string | null) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const ensureCaseType = (value: string) => {
  const normalized = normalizeUpper(value);
  if (!CASE_TYPES.includes(normalized as (typeof CASE_TYPES)[number])) {
    throw new ResponseError(400, "Invalid caseType");
  }
  return normalized;
};

const ensureCaseStatus = (value: string) => {
  const normalized = normalizeUpper(value);
  if (!CASE_STATUSES.includes(normalized as (typeof CASE_STATUSES)[number])) {
    throw new ResponseError(400, "Invalid status");
  }
  return normalized;
};

const ensureCaseRequirements = (payload: {
  caseType: string;
  background: string | null;
  currentCondition: string | null;
  projectDesc: string | null;
}) => {
  if (payload.caseType === "PROBLEM") {
    if (!payload.background || !payload.currentCondition) {
      throw new ResponseError(
        400,
        "background and currentCondition are required for PROBLEM"
      );
    }
  }

  if (payload.caseType === "PROJECT") {
    if (!payload.projectDesc) {
      throw new ResponseError(400, "projectDesc is required for PROJECT");
    }
  }
};

const ensureSbuSubsExist = async (sbuSubIds: number[]) => {
  if (sbuSubIds.length === 0) return;
  const records = await prismaEmployee.em_sbu_sub.findMany({
    where: {
      id: { in: sbuSubIds },
      status: "A",
      OR: [{ isDeleted: false }, { isDeleted: null }],
    },
    select: { id: true },
  });

  const exists = new Set(records.map((record) => record.id));
  const missing = sbuSubIds.filter((id) => !exists.has(id));
  if (missing.length > 0) {
    throw new ResponseError(400, `Invalid SBU Sub: ${missing.join(", ")}`);
  }
};

const normalizeDepartmentIds = (ids: number[]) =>
  Array.from(new Set(ids)).filter((id) => id > 0);

const buildEmployeeCaseFilter = async (access: CaseAccess) => {
  if (access.actorType !== "EMPLOYEE" || access.employeeId === undefined) {
    return undefined;
  }

  const employeeId = access.employeeId;
  const picSubs = await prismaEmployee.em_sbu_sub.findMany({
    where: {
      pic: employeeId,
      status: "A",
      OR: [{ isDeleted: false }, { isDeleted: null }],
    },
    select: { id: true },
  });
  const picSbuSubIds = picSubs.map((sub) => sub.id);

  const orFilters: Prisma.CaseHeaderWhereInput[] = [
    { requesterEmployeeId: employeeId },
    {
      departments: {
        some: {
          assigneeEmployeeId: employeeId,
          isDeleted: false,
        },
      },
    },
  ];

  if (picSbuSubIds.length > 0) {
    orFilters.push({
      departments: {
        some: {
          sbuSubId: { in: picSbuSubIds },
          isDeleted: false,
        },
      },
    });
  }

  return orFilters;
};

export class CaseHeaderService {
  static async create(requesterId: string, reqBody: CreateCaseHeaderRequest) {
    const request = Validation.validate(CaseHeaderValidation.CREATE, reqBody);
    const caseType = ensureCaseType(request.caseType);

    const access = await resolveCaseAccess(requesterId);
    if (access.actorType === "FLOWLY") {
      assertCaseCrud(access);
    }

    const departmentIds = normalizeDepartmentIds(request.departmentSbuSubIds);
    if (departmentIds.length === 0) {
      throw new ResponseError(400, "departmentSbuSubIds is required");
    }

    await ensureSbuSubsExist(departmentIds);
    if (request.originSbuSubId !== undefined) {
      await ensureSbuSubsExist([request.originSbuSubId]);
    }

    const caseId = await generateCaseId();
    const now = new Date();

    const background = normalizeNullableText(request.background) ?? null;
    const currentCondition =
      normalizeNullableText(request.currentCondition) ?? null;
    const projectDesc = normalizeNullableText(request.projectDesc) ?? null;
    const projectObjective =
      normalizeNullableText(request.projectObjective) ?? null;

    ensureCaseRequirements({
      caseType,
      background,
      currentCondition,
      projectDesc,
    });

    const requesterPayload =
      access.actorType === "EMPLOYEE"
        ? { requesterEmployeeId: access.employeeId ?? null }
        : { requesterId };

    const createDepartmentId = await generateCaseDepartmentId();
    const departmentPayloads = departmentIds.map((sbuSubId) => ({
      caseDepartmentId: createDepartmentId(),
      caseId,
      sbuSubId,
      decisionStatus: "PENDING",
      isActive: true,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
      createdBy: requesterId,
      updatedBy: requesterId,
    }));

    const created = await prismaFlowly.$transaction(async (tx) => {
      const headerData: Prisma.CaseHeaderCreateInput & {
        projectDesc?: string | null;
        projectObjective?: string | null;
      } = {
        caseId,
        caseType,
        caseTitle: request.caseTitle.trim(),
        background,
        currentCondition,
        projectDesc,
        projectObjective,
        locationDesc: normalizeNullableText(request.locationDesc) ?? null,
        notes: normalizeNullableText(request.notes) ?? null,
        status: "NEW",
        originSbuSubId: request.originSbuSubId ?? null,
        isActive: true,
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
        createdBy: requesterId,
        updatedBy: requesterId,
        ...requesterPayload,
      };

      const header = await tx.caseHeader.create({
        data: headerData as Prisma.CaseHeaderCreateInput,
      });

      if (departmentPayloads.length > 0) {
        await tx.caseDepartment.createMany({ data: departmentPayloads });
      }

      return header;
    });

    await writeAuditLog({
      module: "CASE",
      entity: "CASE_HEADER",
      entityId: created.caseId,
      action: "CREATE",
      actorId: requesterId,
      actorType: access.actorType,
      snapshot: getCaseSnapshot(created as unknown as Record<string, unknown>),
      meta: { departmentCount: departmentPayloads.length },
    });

    const departmentMap = new Map<number, string>();
    for (const payload of departmentPayloads) {
      departmentMap.set(payload.sbuSubId, payload.caseDepartmentId);
    }

    try {
      await CaseNotificationService.enqueuePicNotifications({
        caseId: created.caseId,
        caseTitle: created.caseTitle,
        caseType: created.caseType,
        departmentMap,
        requesterId,
      });
    } catch (error) {
      logger.warn("Failed to enqueue case PIC notifications", {
        caseId: created.caseId,
        error: (error as Error)?.message ?? error,
      });
    }

    return toCaseHeaderResponse(created);
  }

  static async update(requesterId: string, reqBody: UpdateCaseHeaderRequest) {
    const request = Validation.validate(CaseHeaderValidation.UPDATE, reqBody);

    const access = await resolveCaseAccess(requesterId);
    if (access.actorType === "FLOWLY") {
      assertCaseCrud(access);
    }

    const existing = await prismaFlowly.caseHeader.findUnique({
      where: { caseId: request.caseId },
    });

    if (!existing || existing.isDeleted) {
      throw new ResponseError(404, "Case not found");
    }

    if (
      access.actorType === "EMPLOYEE" &&
      access.employeeId !== undefined &&
      existing.requesterEmployeeId !== access.employeeId
    ) {
      throw new ResponseError(403, "Only requester can update this case");
    }

    if (request.originSbuSubId !== undefined && request.originSbuSubId !== null) {
      await ensureSbuSubsExist([request.originSbuSubId]);
    }

    const nextCaseType = request.caseType
      ? ensureCaseType(request.caseType)
      : existing.caseType;

    const nextBackground =
      request.background !== undefined
        ? normalizeNullableText(request.background) ?? null
        : existing.background ?? null;
    const nextCurrentCondition =
      request.currentCondition !== undefined
        ? normalizeNullableText(request.currentCondition) ?? null
        : existing.currentCondition ?? null;
    const nextProjectDesc =
      request.projectDesc !== undefined
        ? normalizeNullableText(request.projectDesc) ?? null
        : (existing as typeof existing & { projectDesc?: string | null })
            .projectDesc ?? null;

    ensureCaseRequirements({
      caseType: nextCaseType,
      background: nextBackground,
      currentCondition: nextCurrentCondition,
      projectDesc: nextProjectDesc,
    });

    const before = { ...existing } as Record<string, unknown>;
    const updateData: Prisma.CaseHeaderUpdateInput & {
      projectDesc?: string | null;
      projectObjective?: string | null;
    } = {
      caseType: nextCaseType,
      caseTitle: request.caseTitle?.trim() ?? existing.caseTitle,
      status: request.status ? ensureCaseStatus(request.status) : existing.status,
      isActive: request.isActive ?? existing.isActive,
      updatedAt: new Date(),
      updatedBy: requesterId,
    };

    if (request.background !== undefined) {
      updateData.background = nextBackground;
    }
    if (request.currentCondition !== undefined) {
      updateData.currentCondition = nextCurrentCondition;
    }
    if (request.projectDesc !== undefined) {
      updateData.projectDesc = nextProjectDesc;
    }
    if (request.projectObjective !== undefined) {
      updateData.projectObjective =
        normalizeNullableText(request.projectObjective) ?? null;
    }
    if (request.locationDesc !== undefined) {
      updateData.locationDesc =
        normalizeNullableText(request.locationDesc) ?? null;
    }
    if (request.notes !== undefined) {
      updateData.notes = normalizeNullableText(request.notes) ?? null;
    }
    if (request.originSbuSubId !== undefined) {
      updateData.originSbuSubId = request.originSbuSubId ?? null;
    }

    const updated = await prismaFlowly.caseHeader.update({
      where: { caseId: request.caseId },
      data: updateData,
    });

    const changes = buildChanges(
      before,
      updated as unknown as Record<string, unknown>,
      CASE_AUDIT_FIELDS as unknown as string[]
    );

    if (changes.length > 0) {
      await writeAuditLog({
        module: "CASE",
        entity: "CASE_HEADER",
        entityId: updated.caseId,
        action: "UPDATE",
        actorId: requesterId,
        actorType: resolveActorType(requesterId),
        changes,
      });
    }

    return toCaseHeaderResponse(updated);
  }

  static async softDelete(
    requesterId: string,
    reqBody: DeleteCaseHeaderRequest
  ) {
    const request = Validation.validate(CaseHeaderValidation.DELETE, reqBody);

    const access = await resolveCaseAccess(requesterId);
    if (access.actorType === "FLOWLY") {
      assertCaseCrud(access);
    }

    const existing = await prismaFlowly.caseHeader.findUnique({
      where: { caseId: request.caseId },
    });

    if (!existing || existing.isDeleted) {
      throw new ResponseError(404, "Case not found");
    }

    if (
      access.actorType === "EMPLOYEE" &&
      access.employeeId !== undefined &&
      existing.requesterEmployeeId !== access.employeeId
    ) {
      throw new ResponseError(403, "Only requester can delete this case");
    }

    const now = new Date();

    const counts = await prismaFlowly.$transaction(async (tx) => {
      const departments = await tx.caseDepartment.updateMany({
        where: { caseId: request.caseId, isDeleted: false },
        data: {
          isDeleted: true,
          isActive: false,
          deletedAt: now,
          deletedBy: requesterId,
          updatedAt: now,
          updatedBy: requesterId,
        },
      });

      const attachments = await tx.caseAttachment.updateMany({
        where: { caseId: request.caseId, isDeleted: false },
        data: {
          isDeleted: true,
          isActive: false,
          deletedAt: now,
          deletedBy: requesterId,
          updatedAt: now,
          updatedBy: requesterId,
        },
      });

      const notifications = await (tx as typeof tx & {
        caseNotificationOutbox: {
          updateMany: (args: unknown) => Promise<{ count: number }>;
        };
      }).caseNotificationOutbox.updateMany({
        where: { caseId: request.caseId, isDeleted: false },
        data: {
          isDeleted: true,
          isActive: false,
          deletedAt: now,
          deletedBy: requesterId,
          updatedAt: now,
          updatedBy: requesterId,
        },
      });

      const fishbones = await tx.caseFishboneMaster.findMany({
        where: { caseId: request.caseId, isDeleted: false },
        select: { caseFishboneId: true },
      });
      const fishboneIds = fishbones.map((item) => item.caseFishboneId);

      let causeCount = 0;
      let itemCount = 0;
      let itemCauseCount = 0;
      let fishboneCount = 0;

      if (fishboneIds.length > 0) {
        const items = await tx.caseFishboneItem.findMany({
          where: { caseFishboneId: { in: fishboneIds }, isDeleted: false },
          select: { caseFishboneItemId: true },
        });
        const itemIds = items.map((item) => item.caseFishboneItemId);

        if (itemIds.length > 0) {
          const itemCauseResult = await tx.caseFishboneItemCause.updateMany({
            where: { caseFishboneItemId: { in: itemIds }, isDeleted: false },
            data: {
              isDeleted: true,
              isActive: false,
              deletedAt: now,
              deletedBy: requesterId,
              updatedAt: now,
              updatedBy: requesterId,
            },
          });
          itemCauseCount = itemCauseResult.count;
        }

        const causeResult = await tx.caseFishboneCause.updateMany({
          where: { caseFishboneId: { in: fishboneIds }, isDeleted: false },
          data: {
            isDeleted: true,
            isActive: false,
            deletedAt: now,
            deletedBy: requesterId,
            updatedAt: now,
            updatedBy: requesterId,
          },
        });
        causeCount = causeResult.count;

        const itemResult = await tx.caseFishboneItem.updateMany({
          where: { caseFishboneId: { in: fishboneIds }, isDeleted: false },
          data: {
            isDeleted: true,
            isActive: false,
            deletedAt: now,
            deletedBy: requesterId,
            updatedAt: now,
            updatedBy: requesterId,
          },
        });
        itemCount = itemResult.count;

        const fishboneResult = await tx.caseFishboneMaster.updateMany({
          where: { caseFishboneId: { in: fishboneIds }, isDeleted: false },
          data: {
            isDeleted: true,
            isActive: false,
            deletedAt: now,
            deletedBy: requesterId,
            updatedAt: now,
            updatedBy: requesterId,
          },
        });
        fishboneCount = fishboneResult.count;
      }

      await tx.caseHeader.update({
        where: { caseId: request.caseId },
        data: {
          isDeleted: true,
          isActive: false,
          deletedAt: now,
          deletedBy: requesterId,
          updatedAt: now,
          updatedBy: requesterId,
        },
      });

      return {
        departments: departments.count,
        attachments: attachments.count,
        notifications: notifications.count,
        fishbones: fishboneCount,
        causes: causeCount,
        items: itemCount,
        itemCauses: itemCauseCount,
      };
    });

    await writeAuditLog({
      module: "CASE",
      entity: "CASE_HEADER",
      entityId: existing.caseId,
      action: "DELETE",
      actorId: requesterId,
      actorType: resolveActorType(requesterId),
      snapshot: getCaseSnapshot(existing as unknown as Record<string, unknown>),
      meta: counts,
    });

    return { message: "Case deleted" };
  }

  static async list(
    requesterId: string,
    filters?: {
      caseId?: string;
      caseType?: string;
      status?: string;
      originSbuSubId?: number;
      requesterEmployeeId?: number;
      requesterId?: string;
      sbuSubId?: number;
      assigneeEmployeeId?: number;
      decisionStatus?: string;
    }
  ) {
    const access = await resolveCaseAccess(requesterId);
    assertCaseRead(access);

    const whereClause: Prisma.CaseHeaderWhereInput = {
      isDeleted: false,
      ...(access.actorType === "FLOWLY" && !access.canCrud ? { isActive: true } : {}),
      ...(filters?.caseId ? { caseId: filters.caseId } : {}),
      ...(filters?.caseType ? { caseType: filters.caseType } : {}),
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.originSbuSubId !== undefined
        ? { originSbuSubId: filters.originSbuSubId }
        : {}),
      ...(filters?.requesterEmployeeId !== undefined
        ? { requesterEmployeeId: filters.requesterEmployeeId }
        : {}),
      ...(filters?.requesterId ? { requesterId: filters.requesterId } : {}),
    };

    const deptFilters: Prisma.CaseDepartmentWhereInput = {
      isDeleted: false,
      ...(filters?.sbuSubId !== undefined ? { sbuSubId: filters.sbuSubId } : {}),
      ...(filters?.assigneeEmployeeId !== undefined
        ? { assigneeEmployeeId: filters.assigneeEmployeeId }
        : {}),
      ...(filters?.decisionStatus ? { decisionStatus: filters.decisionStatus } : {}),
    };

    if (Object.keys(deptFilters).length > 1) {
      whereClause.departments = { some: deptFilters };
    }

    if (access.actorType === "EMPLOYEE") {
      const employeeFilters = await buildEmployeeCaseFilter(access);
      if (!employeeFilters || employeeFilters.length === 0) {
        return [];
      }
      whereClause.OR = employeeFilters;
    }

    const list = await prismaFlowly.caseHeader.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    return list.map(toCaseHeaderListResponse);
  }
}
