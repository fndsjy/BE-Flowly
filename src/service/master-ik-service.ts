import { prismaFlowly } from "../application/database.js";
import { Validation } from "../validation/validation.js";
import { MasterIkValidation } from "../validation/master-ik-validation.js";
import { ResponseError } from "../error/response-error.js";
import { generateMasterIkId } from "../utils/id-generator.js";
import { assertProcedureCrud, getProcedureAccess } from "../utils/procedure-access.js";
import { buildRevisionWhere, getBaseNumber, isRevisionNumber } from "../utils/procedure-utils.js";
import { buildChanges, pickSnapshot, writeAuditLog } from "../utils/audit-log.js";

import {
  type CreateMasterIkRequest,
  type UpdateMasterIkRequest,
  type DeleteMasterIkRequest,
  toMasterIkResponse,
  toMasterIkListResponse,
} from "../model/master-ik-model.js";

const IK_AUDIT_FIELDS = [
  "ikName",
  "ikNumber",
  "effectiveDate",
  "ikContent",
  "isActive",
  "isDeleted",
] as const;

const getIkAuditSnapshot = (record: Record<string, unknown>) =>
  pickSnapshot(record, IK_AUDIT_FIELDS as unknown as string[]);

export class MasterIkService {
  static async create(requesterId: string, reqBody: CreateMasterIkRequest) {
    const request = Validation.validate(MasterIkValidation.CREATE, reqBody);

    const access = await getProcedureAccess(requesterId);
    assertProcedureCrud(access);

    const baseNumber = getBaseNumber(request.ikNumber);
    const activeExisting = await prismaFlowly.masterIK.findFirst({
      where: {
        isDeleted: false,
        isActive: true,
        ...buildRevisionWhere("ikNumber", baseNumber),
      },
      orderBy: { effectiveDate: "desc" },
    });

    if (activeExisting && request.effectiveDate <= activeExisting.effectiveDate) {
      throw new ResponseError(400, "effectiveDate must be newer than active IK");
    }

    const ikId = await generateMasterIkId();
    const now = new Date();

    const { created, deactivatedIds } = await prismaFlowly.$transaction(async (tx) => {
      const toDeactivate = await tx.masterIK.findMany({
        where: {
          isDeleted: false,
          isActive: true,
          ...buildRevisionWhere("ikNumber", baseNumber),
        },
      });

      const ids = toDeactivate.map((item) => item.ikId);

      if (ids.length > 0) {
        await tx.masterIK.updateMany({
          where: { ikId: { in: ids } },
          data: {
            isActive: false,
            updatedAt: now,
            updatedBy: requesterId,
          },
        });
      }

      const created = await tx.masterIK.create({
        data: {
          ikId,
          ikName: request.ikName,
          ikNumber: request.ikNumber.trim(),
          effectiveDate: request.effectiveDate,
          ikContent: request.ikContent ?? null,
          isActive: true,
          isDeleted: false,
          createdBy: requesterId,
          updatedBy: requesterId,
        },
      });

      return { created, deactivatedIds: ids };
    });

    if (deactivatedIds.length > 0) {
      await writeAuditLog({
        module: "PROCEDURE",
        entity: "IK",
        entityId: created.ikId,
        action: "AUTO_DEACTIVATE",
        actorId: requesterId,
        actorType: access.actorType,
        meta: {
          ikIds: deactivatedIds,
        },
      });
    }

    await writeAuditLog({
      module: "PROCEDURE",
      entity: "IK",
      entityId: created.ikId,
      action: "CREATE",
      actorId: requesterId,
      actorType: access.actorType,
      snapshot: getIkAuditSnapshot(created as unknown as Record<string, unknown>),
    });

    return toMasterIkResponse(created);
  }

  static async update(requesterId: string, reqBody: UpdateMasterIkRequest) {
    const request = Validation.validate(MasterIkValidation.UPDATE, reqBody);

    const access = await getProcedureAccess(requesterId);
    assertProcedureCrud(access);

    const existing = await prismaFlowly.masterIK.findUnique({
      where: { ikId: request.ikId },
    });

    if (!existing || existing.isDeleted) {
      throw new ResponseError(404, "IK not found");
    }

    if (request.effectiveDate) {
      throw new ResponseError(400, "Use create to add new effective date");
    }

    const nextIkNumber = request.ikNumber?.trim();

    if (nextIkNumber && nextIkNumber !== existing.ikNumber) {
      if (isRevisionNumber(nextIkNumber, existing.ikNumber)) {
        throw new ResponseError(400, "Use create to revise IK number");
      }

      const baseNumber = getBaseNumber(nextIkNumber);
      const activeOther = await prismaFlowly.masterIK.findFirst({
        where: {
          ikId: { not: existing.ikId },
          isDeleted: false,
          isActive: true,
          ...buildRevisionWhere("ikNumber", baseNumber),
        },
      });

      if (activeOther) {
        throw new ResponseError(400, "Another active IK with this number exists");
      }
    }

    if (request.isActive === true && existing.isActive === false) {
      const baseNumber = getBaseNumber(existing.ikNumber);
      const activeOther = await prismaFlowly.masterIK.findFirst({
        where: {
          ikId: { not: existing.ikId },
          isDeleted: false,
          isActive: true,
          ...buildRevisionWhere("ikNumber", baseNumber),
        },
      });

      if (activeOther) {
        throw new ResponseError(400, "Deactivate other IK revisions first");
      }
    }

    const before = { ...existing } as Record<string, unknown>;

    const updated = await prismaFlowly.masterIK.update({
      where: { ikId: request.ikId },
      data: {
        ikName: request.ikName ?? existing.ikName,
        ikNumber: nextIkNumber ?? existing.ikNumber,
        ikContent: request.ikContent === undefined ? existing.ikContent : request.ikContent,
        isActive: request.isActive ?? existing.isActive,
        updatedAt: new Date(),
        updatedBy: requesterId,
      },
    });

    const changes = buildChanges(
      before,
      updated as unknown as Record<string, unknown>,
      IK_AUDIT_FIELDS as unknown as string[]
    );

    if (changes.length > 0) {
      await writeAuditLog({
        module: "PROCEDURE",
        entity: "IK",
        entityId: updated.ikId,
        action: "UPDATE",
        actorId: requesterId,
        actorType: access.actorType,
        changes,
      });
    }

    return toMasterIkResponse(updated);
  }

  static async softDelete(requesterId: string, reqBody: DeleteMasterIkRequest) {
    const request = Validation.validate(MasterIkValidation.DELETE, reqBody);

    const access = await getProcedureAccess(requesterId);
    assertProcedureCrud(access);

    const existing = await prismaFlowly.masterIK.findUnique({
      where: { ikId: request.ikId },
    });

    if (!existing || existing.isDeleted) {
      throw new ResponseError(404, "IK not found");
    }

    const now = new Date();

    const { linkDeletedCount } = await prismaFlowly.$transaction(async (tx) => {
      const linkResult = await tx.procedureSopIK.updateMany({
        where: { ikId: request.ikId, isDeleted: false },
        data: {
          isDeleted: true,
          isActive: false,
          deletedAt: now,
          deletedBy: requesterId,
        },
      });

      await tx.masterIK.update({
        where: { ikId: request.ikId },
        data: {
          isDeleted: true,
          isActive: false,
          deletedAt: now,
          deletedBy: requesterId,
        },
      });

      return { linkDeletedCount: linkResult.count };
    });

    const payload = {
      module: "PROCEDURE",
      entity: "IK",
      entityId: existing.ikId,
      action: "DELETE",
      actorId: requesterId,
      actorType: access.actorType,
      snapshot: getIkAuditSnapshot(existing as unknown as Record<string, unknown>),
    } as const;
    const meta = linkDeletedCount > 0 ? { linkCount: linkDeletedCount } : undefined;
    await writeAuditLog(meta ? { ...payload, meta } : payload);

    return { message: "IK deleted" };
  }

  static async list(
    requesterId: string,
    filters?: {
      sopId?: string;
    }
  ) {
    const access = await getProcedureAccess(requesterId);

    if (filters?.sopId) {
      const sop = await prismaFlowly.procedureSop.findUnique({
        where: { sopId: filters.sopId },
        select: { isDeleted: true, isActive: true },
      });
      if (!sop || sop.isDeleted || !sop.isActive) {
        return [];
      }
    }

    const whereClause: Record<string, unknown> = {
      isDeleted: false,
      ...(access.canCrud ? {} : { isActive: true }),
    };

    if (filters?.sopId) {
      const linkWhere = {
        sopId: filters.sopId,
        isDeleted: false,
        ...(access.canCrud ? {} : { isActive: true }),
      };
      Object.assign(whereClause, {
        sops: {
          some: linkWhere,
        },
      });
    }

    const list = await prismaFlowly.masterIK.findMany({
      where: whereClause,
      orderBy: { effectiveDate: "desc" },
    });

    return list.map(toMasterIkListResponse);
  }
}
