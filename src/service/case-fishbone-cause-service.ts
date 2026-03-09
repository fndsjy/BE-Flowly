import { prismaFlowly } from "../application/database.js";
import { Validation } from "../validation/validation.js";
import { CaseFishboneCauseValidation } from "../validation/case-fishbone-cause-validation.js";
import { ResponseError } from "../error/response-error.js";
import { generateCaseFishboneCauseId } from "../utils/id-generator.js";
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
  isPicForSbuSub,
  isAssigneeForSbuSub,
  canEmployeeViewFishbone,
  resolveCaseAccess,
} from "../utils/case-access.js";
import type { Prisma } from "../generated/flowly/client.js";
import {
  type CreateCaseFishboneCauseRequest,
  type UpdateCaseFishboneCauseRequest,
  type DeleteCaseFishboneCauseRequest,
  toCaseFishboneCauseResponse,
  toCaseFishboneCauseListResponse,
} from "../model/case-fishbone-cause-model.js";

const CAUSE_AUDIT_FIELDS = [
  "caseFishboneId",
  "causeNo",
  "causeText",
  "isActive",
  "isDeleted",
] as const;

const getCauseSnapshot = (record: Record<string, unknown>) =>
  pickSnapshot(record, CAUSE_AUDIT_FIELDS as unknown as string[]);

const normalizeText = (value: string) => value.trim();

const ensureCaseFishboneAccess = async (
  caseFishboneId: string,
  employeeId?: number
) => {
  const fishbone = await prismaFlowly.caseFishboneMaster.findUnique({
    where: { caseFishboneId },
    select: { caseId: true, sbuSubId: true, isDeleted: true },
  });

  if (!fishbone || fishbone.isDeleted) {
    throw new ResponseError(404, "Case fishbone not found");
  }

  if (employeeId !== undefined) {
    const department = await prismaFlowly.caseDepartment.findFirst({
      where: {
        caseId: fishbone.caseId,
        sbuSubId: fishbone.sbuSubId,
        isDeleted: false,
      },
      select: { caseDepartmentId: true },
    });

    if (!department) {
      throw new ResponseError(404, "Case department not found");
    }

    const isPic = await isPicForSbuSub(employeeId, fishbone.sbuSubId);
    const isAssignee = await isAssigneeForSbuSub(
      employeeId,
      fishbone.caseId,
      fishbone.sbuSubId
    );
    if (!isPic && !isAssignee) {
      throw new ResponseError(403, "No access to case fishbone");
    }
  }

  return fishbone;
};

export class CaseFishboneCauseService {
  static async create(
    requesterId: string,
    reqBody: CreateCaseFishboneCauseRequest
  ) {
    const request = Validation.validate(
      CaseFishboneCauseValidation.CREATE,
      reqBody
    );

    const access = await resolveCaseAccess(requesterId);
    let fishbone = null;
    if (access.actorType === "FLOWLY") {
      assertCaseCrud(access);
      fishbone = await ensureCaseFishboneAccess(request.caseFishboneId);
    } else if (access.employeeId !== undefined) {
      fishbone = await ensureCaseFishboneAccess(
        request.caseFishboneId,
        access.employeeId
      );
    } else {
      fishbone = await ensureCaseFishboneAccess(request.caseFishboneId);
    }

    if (fishbone) {
      await ensureCaseNotClosed(fishbone.caseId);
    }

    const existingNumber = await prismaFlowly.caseFishboneCause.findFirst({
      where: {
        caseFishboneId: request.caseFishboneId,
        causeNo: request.causeNo,
      },
      select: { caseFishboneCauseId: true },
    });

    if (existingNumber) {
      throw new ResponseError(400, "Cause number already exists");
    }

    const createId = await generateCaseFishboneCauseId();
    const caseFishboneCauseId = createId();
    const now = new Date();

    const created = await prismaFlowly.caseFishboneCause.create({
      data: {
        caseFishboneCauseId,
        caseFishboneId: request.caseFishboneId,
        causeNo: request.causeNo,
        causeText: normalizeText(request.causeText),
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
      entity: "CASE_FISHBONE_CAUSE",
      entityId: created.caseFishboneCauseId,
      action: "CREATE",
      actorId: requesterId,
      actorType: access.actorType,
      snapshot: getCauseSnapshot(created as unknown as Record<string, unknown>),
      meta: { caseFishboneId: created.caseFishboneId },
    });

    return toCaseFishboneCauseResponse(created);
  }

  static async update(
    requesterId: string,
    reqBody: UpdateCaseFishboneCauseRequest
  ) {
    const request = Validation.validate(
      CaseFishboneCauseValidation.UPDATE,
      reqBody
    );

    const access = await resolveCaseAccess(requesterId);
    if (access.actorType === "FLOWLY") {
      assertCaseCrud(access);
    }

    const existing = await prismaFlowly.caseFishboneCause.findUnique({
      where: { caseFishboneCauseId: request.caseFishboneCauseId },
    });

    if (!existing || existing.isDeleted) {
      throw new ResponseError(404, "Case fishbone cause not found");
    }

    const fishbone = await ensureCaseFishboneAccess(
      existing.caseFishboneId,
      access.actorType === "EMPLOYEE" ? access.employeeId : undefined
    );

    await ensureCaseNotClosed(fishbone.caseId);

    if (
      request.causeNo !== undefined &&
      request.causeNo !== existing.causeNo
    ) {
      const duplicate = await prismaFlowly.caseFishboneCause.findFirst({
        where: {
          caseFishboneId: existing.caseFishboneId,
          causeNo: request.causeNo,
          caseFishboneCauseId: { not: existing.caseFishboneCauseId },
        },
        select: { caseFishboneCauseId: true },
      });

      if (duplicate) {
        throw new ResponseError(400, "Cause number already exists");
      }
    }

    const before = { ...existing } as Record<string, unknown>;
    const updateData: Prisma.CaseFishboneCauseUpdateInput = {
      causeNo: request.causeNo ?? existing.causeNo,
      causeText:
        request.causeText !== undefined
          ? normalizeText(request.causeText)
          : existing.causeText,
      isActive: request.isActive ?? existing.isActive,
      updatedAt: new Date(),
      updatedBy: requesterId,
    };

    const updated = await prismaFlowly.caseFishboneCause.update({
      where: { caseFishboneCauseId: request.caseFishboneCauseId },
      data: updateData,
    });

    const changes = buildChanges(
      before,
      updated as unknown as Record<string, unknown>,
      CAUSE_AUDIT_FIELDS as unknown as string[]
    );

    if (changes.length > 0) {
      await writeAuditLog({
        module: "CASE",
        entity: "CASE_FISHBONE_CAUSE",
        entityId: updated.caseFishboneCauseId,
        action: "UPDATE",
        actorId: requesterId,
        actorType: resolveActorType(requesterId),
        changes,
        meta: { caseFishboneId: updated.caseFishboneId },
      });
    }

    return toCaseFishboneCauseResponse(updated);
  }

  static async softDelete(
    requesterId: string,
    reqBody: DeleteCaseFishboneCauseRequest
  ) {
    const request = Validation.validate(
      CaseFishboneCauseValidation.DELETE,
      reqBody
    );

    const access = await resolveCaseAccess(requesterId);
    if (access.actorType === "FLOWLY") {
      assertCaseCrud(access);
    }

    const existing = await prismaFlowly.caseFishboneCause.findUnique({
      where: { caseFishboneCauseId: request.caseFishboneCauseId },
    });

    if (!existing || existing.isDeleted) {
      throw new ResponseError(404, "Case fishbone cause not found");
    }

    const fishbone = await ensureCaseFishboneAccess(
      existing.caseFishboneId,
      access.actorType === "EMPLOYEE" ? access.employeeId : undefined
    );

    await ensureCaseNotClosed(fishbone.caseId);

    const now = new Date();

    const { linkCount } = await prismaFlowly.$transaction(async (tx) => {
      const linkResult = await tx.caseFishboneItemCause.updateMany({
        where: {
          caseFishboneCauseId: request.caseFishboneCauseId,
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
      });

      await tx.caseFishboneCause.update({
        where: { caseFishboneCauseId: request.caseFishboneCauseId },
        data: {
          isDeleted: true,
          isActive: false,
          deletedAt: now,
          deletedBy: requesterId,
          updatedAt: now,
          updatedBy: requesterId,
        },
      });

      return { linkCount: linkResult.count };
    });

    await writeAuditLog({
      module: "CASE",
      entity: "CASE_FISHBONE_CAUSE",
      entityId: existing.caseFishboneCauseId,
      action: "DELETE",
      actorId: requesterId,
      actorType: resolveActorType(requesterId),
      snapshot: getCauseSnapshot(existing as unknown as Record<string, unknown>),
      meta: { caseFishboneId: existing.caseFishboneId, linkCount },
    });

    return { message: "Case fishbone cause deleted" };
  }

  static async list(
    requesterId: string,
    filters?: {
      caseFishboneId?: string;
    }
  ) {
    const access = await resolveCaseAccess(requesterId);
    assertCaseRead(access);

    if (access.actorType === "EMPLOYEE" && access.employeeId !== undefined) {
      if (!filters?.caseFishboneId) {
        return [];
      }
      const canView = await canEmployeeViewFishbone(
        access.employeeId,
        filters.caseFishboneId
      );
      if (!canView) {
        return [];
      }
    }

    const whereClause: Prisma.CaseFishboneCauseWhereInput = {
      isDeleted: false,
      ...(access.actorType === "FLOWLY" && !access.canCrud ? { isActive: true } : {}),
      ...(filters?.caseFishboneId
        ? { caseFishboneId: filters.caseFishboneId }
        : {}),
    };

    const list = await prismaFlowly.caseFishboneCause.findMany({
      where: whereClause,
      orderBy: { causeNo: "asc" },
    });

    return list.map(toCaseFishboneCauseListResponse);
  }
}
