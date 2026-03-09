import { prismaEmployee, prismaFlowly } from "../application/database.js";
import { Validation } from "../validation/validation.js";
import { CaseFishboneValidation } from "../validation/case-fishbone-validation.js";
import { ResponseError } from "../error/response-error.js";
import { generateCaseFishboneId } from "../utils/id-generator.js";
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
  isEmployeeInvolvedInCase,
  isPicForSbuSub,
  isAssigneeForSbuSub,
  resolveCaseAccess,
} from "../utils/case-access.js";
import type { Prisma } from "../generated/flowly/client.js";
import {
  type CreateCaseFishboneRequest,
  type UpdateCaseFishboneRequest,
  type DeleteCaseFishboneRequest,
  toCaseFishboneResponse,
  toCaseFishboneListResponse,
} from "../model/case-fishbone-model.js";

const FISHBONE_AUDIT_FIELDS = [
  "caseId",
  "sbuSubId",
  "fishboneName",
  "fishboneDesc",
  "isActive",
  "isDeleted",
] as const;

const getFishboneSnapshot = (record: Record<string, unknown>) =>
  pickSnapshot(record, FISHBONE_AUDIT_FIELDS as unknown as string[]);

const normalizeNullableText = (value?: string | null) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const ensureCaseDepartmentAccess = async (
  caseId: string,
  sbuSubId: number,
  employeeId?: number
) => {
  const caseHeader = await prismaFlowly.caseHeader.findUnique({
    where: { caseId },
    select: { caseId: true, isDeleted: true },
  });
  if (!caseHeader || caseHeader.isDeleted) {
    throw new ResponseError(404, "Case not found");
  }

  const department = await prismaFlowly.caseDepartment.findFirst({
    where: { caseId, sbuSubId, isDeleted: false },
    select: { caseDepartmentId: true },
  });

  if (!department) {
    throw new ResponseError(404, "Case department not found");
  }

  if (employeeId !== undefined) {
    const isPic = await isPicForSbuSub(employeeId, sbuSubId);
    const isAssignee = await isAssigneeForSbuSub(employeeId, caseId, sbuSubId);
    if (!isPic && !isAssignee) {
      throw new ResponseError(403, "No access to this case department");
    }
  }
};

export class CaseFishboneService {
  static async create(requesterId: string, reqBody: CreateCaseFishboneRequest) {
    const request = Validation.validate(CaseFishboneValidation.CREATE, reqBody);

    const access = await resolveCaseAccess(requesterId);
    if (access.actorType === "FLOWLY") {
      assertCaseCrud(access);
      await ensureCaseDepartmentAccess(request.caseId, request.sbuSubId);
    } else if (access.employeeId !== undefined) {
      await ensureCaseDepartmentAccess(
        request.caseId,
        request.sbuSubId,
        access.employeeId
      );
    } else {
      await ensureCaseDepartmentAccess(request.caseId, request.sbuSubId);
    }

    await ensureCaseNotClosed(request.caseId);

    const fishboneId = await generateCaseFishboneId();
    const now = new Date();

    const created = await prismaFlowly.caseFishboneMaster.create({
      data: {
        caseFishboneId: fishboneId,
        caseId: request.caseId,
        sbuSubId: request.sbuSubId,
        fishboneName: request.fishboneName.trim(),
        fishboneDesc: normalizeNullableText(request.fishboneDesc) ?? null,
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
      entity: "CASE_FISHBONE",
      entityId: created.caseFishboneId,
      action: "CREATE",
      actorId: requesterId,
      actorType: access.actorType,
      snapshot: getFishboneSnapshot(created as unknown as Record<string, unknown>),
      meta: { caseId: created.caseId },
    });

    return toCaseFishboneResponse(created);
  }

  static async update(requesterId: string, reqBody: UpdateCaseFishboneRequest) {
    const request = Validation.validate(CaseFishboneValidation.UPDATE, reqBody);

    const access = await resolveCaseAccess(requesterId);
    if (access.actorType === "FLOWLY") {
      assertCaseCrud(access);
    }

    const existing = await prismaFlowly.caseFishboneMaster.findUnique({
      where: { caseFishboneId: request.caseFishboneId },
    });

    if (!existing || existing.isDeleted) {
      throw new ResponseError(404, "Case fishbone not found");
    }

    await ensureCaseNotClosed(existing.caseId);

    if (access.actorType === "EMPLOYEE" && access.employeeId !== undefined) {
      await ensureCaseDepartmentAccess(
        existing.caseId,
        existing.sbuSubId,
        access.employeeId
      );
    }

    const before = { ...existing } as Record<string, unknown>;
    const updateData: Prisma.CaseFishboneMasterUpdateInput = {
      fishboneName: request.fishboneName?.trim() ?? existing.fishboneName,
      isActive: request.isActive ?? existing.isActive,
      updatedAt: new Date(),
      updatedBy: requesterId,
    };

    if (request.fishboneDesc !== undefined) {
      updateData.fishboneDesc = normalizeNullableText(request.fishboneDesc) ?? null;
    }

    const updated = await prismaFlowly.caseFishboneMaster.update({
      where: { caseFishboneId: request.caseFishboneId },
      data: updateData,
    });

    const changes = buildChanges(
      before,
      updated as unknown as Record<string, unknown>,
      FISHBONE_AUDIT_FIELDS as unknown as string[]
    );

    if (changes.length > 0) {
      await writeAuditLog({
        module: "CASE",
        entity: "CASE_FISHBONE",
        entityId: updated.caseFishboneId,
        action: "UPDATE",
        actorId: requesterId,
        actorType: resolveActorType(requesterId),
        changes,
        meta: { caseId: updated.caseId },
      });
    }

    return toCaseFishboneResponse(updated);
  }

  static async softDelete(
    requesterId: string,
    reqBody: DeleteCaseFishboneRequest
  ) {
    const request = Validation.validate(CaseFishboneValidation.DELETE, reqBody);

    const access = await resolveCaseAccess(requesterId);
    if (access.actorType === "FLOWLY") {
      assertCaseCrud(access);
    }

    const existing = await prismaFlowly.caseFishboneMaster.findUnique({
      where: { caseFishboneId: request.caseFishboneId },
    });

    if (!existing || existing.isDeleted) {
      throw new ResponseError(404, "Case fishbone not found");
    }

    await ensureCaseNotClosed(existing.caseId);

    if (access.actorType === "EMPLOYEE" && access.employeeId !== undefined) {
      await ensureCaseDepartmentAccess(
        existing.caseId,
        existing.sbuSubId,
        access.employeeId
      );
    }

    const now = new Date();

    const { causeCount, itemCount, linkCount } =
      await prismaFlowly.$transaction(async (tx) => {
        const items = await tx.caseFishboneItem.findMany({
          where: {
            caseFishboneId: request.caseFishboneId,
            isDeleted: false,
          },
          select: { caseFishboneItemId: true },
        });
        const itemIds = items.map((item) => item.caseFishboneItemId);

        const linkResult =
          itemIds.length > 0
            ? await tx.caseFishboneItemCause.updateMany({
                where: {
                  caseFishboneItemId: { in: itemIds },
                  isDeleted: false,
                },
                data: {
                  isDeleted: true,
                  isActive: false,
                  deletedAt: now,
                  deletedBy: requesterId,
                  updatedAt: now,
                  updatedBy: requesterId,
                },
              })
            : { count: 0 };

        const causeResult = await tx.caseFishboneCause.updateMany({
          where: { caseFishboneId: request.caseFishboneId, isDeleted: false },
          data: {
            isDeleted: true,
            isActive: false,
            deletedAt: now,
            deletedBy: requesterId,
            updatedAt: now,
            updatedBy: requesterId,
          },
        });

        const itemResult = await tx.caseFishboneItem.updateMany({
          where: { caseFishboneId: request.caseFishboneId, isDeleted: false },
          data: {
            isDeleted: true,
            isActive: false,
            deletedAt: now,
            deletedBy: requesterId,
            updatedAt: now,
            updatedBy: requesterId,
          },
        });

        await tx.caseFishboneMaster.update({
          where: { caseFishboneId: request.caseFishboneId },
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
          causeCount: causeResult.count,
          itemCount: itemResult.count,
          linkCount: linkResult.count,
        };
      });

    await writeAuditLog({
      module: "CASE",
      entity: "CASE_FISHBONE",
      entityId: existing.caseFishboneId,
      action: "DELETE",
      actorId: requesterId,
      actorType: resolveActorType(requesterId),
      snapshot: getFishboneSnapshot(existing as unknown as Record<string, unknown>),
      meta: { caseId: existing.caseId, causeCount, itemCount, linkCount },
    });

    return { message: "Case fishbone deleted" };
  }

  static async list(
    requesterId: string,
    filters?: {
      caseId?: string;
      sbuSubId?: number;
      caseFishboneId?: string;
    }
  ) {
    const access = await resolveCaseAccess(requesterId);
    assertCaseRead(access);

    const whereClause: Prisma.CaseFishboneMasterWhereInput = {
      isDeleted: false,
      ...(access.actorType === "FLOWLY" && !access.canCrud ? { isActive: true } : {}),
      ...(filters?.caseId ? { caseId: filters.caseId } : {}),
      ...(filters?.sbuSubId !== undefined ? { sbuSubId: filters.sbuSubId } : {}),
      ...(filters?.caseFishboneId ? { caseFishboneId: filters.caseFishboneId } : {}),
    };

    if (access.actorType === "EMPLOYEE" && access.employeeId !== undefined) {
      const employeeId = access.employeeId;
      if (filters?.caseId) {
        const caseId = filters.caseId;
        const canView = await isEmployeeInvolvedInCase(employeeId, caseId);
        if (!canView) {
          return [];
        }
      } else if (filters?.caseFishboneId) {
        const fishbone = await prismaFlowly.caseFishboneMaster.findUnique({
          where: { caseFishboneId: filters.caseFishboneId },
          select: { caseId: true, sbuSubId: true, isDeleted: true },
        });
        if (!fishbone || fishbone.isDeleted) return [];
        const canView = await isEmployeeInvolvedInCase(
          employeeId,
          fishbone.caseId
        );
        if (!canView) {
          return [];
        }
      } else {
        const assignments = await prismaFlowly.caseDepartment.findMany({
          where: {
            isDeleted: false,
            OR: [
              {
                assignees: {
                  some: { employeeId, isDeleted: false },
                },
              },
              { assigneeEmployeeId: employeeId },
            ],
          },
          select: { caseId: true, sbuSubId: true },
        });

        const picSubs = await prismaEmployee.em_sbu_sub.findMany({
          where: {
            pic: employeeId,
            status: "A",
            OR: [{ isDeleted: false }, { isDeleted: null }],
          },
          select: { id: true },
        });

        const picSbuSubIds = picSubs.map((sub) => sub.id);

        const orFilters: Prisma.CaseFishboneMasterWhereInput[] = [];

        for (const item of assignments) {
          orFilters.push({ caseId: item.caseId, sbuSubId: item.sbuSubId });
        }

        if (picSbuSubIds.length > 0) {
          orFilters.push({ sbuSubId: { in: picSbuSubIds } });
        }

        const requestedCases = await prismaFlowly.caseHeader.findMany({
          where: { requesterEmployeeId: employeeId, isDeleted: false },
          select: { caseId: true },
        });
        const requesterCaseIds = requestedCases.map((item) => item.caseId);
        if (requesterCaseIds.length > 0) {
          orFilters.push({ caseId: { in: requesterCaseIds } });
        }

        if (orFilters.length === 0) {
          return [];
        }

        whereClause.AND = [{ OR: orFilters }];
      }
    }

    const list = await prismaFlowly.caseFishboneMaster.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    return list.map(toCaseFishboneListResponse);
  }
}
