import { prismaEmployee, prismaFlowly } from "../application/database.js";
import { Validation } from "../validation/validation.js";
import { ProcedureSopValidation } from "../validation/procedure-sop-validation.js";
import { ResponseError } from "../error/response-error.js";
import { generateProcedureSopId } from "../utils/id-generator.js";
import { assertProcedureCrud, getProcedureAccess } from "../utils/procedure-access.js";
import { buildRevisionWhere, getBaseNumber, isRevisionNumber } from "../utils/procedure-utils.js";
import { buildChanges, pickSnapshot, writeAuditLog } from "../utils/audit-log.js";

import {
  type CreateProcedureSopRequest,
  type UpdateProcedureSopRequest,
  type DeleteProcedureSopRequest,
  toProcedureSopResponse,
  toProcedureSopListResponse,
} from "../model/procedure-sop-model.js";

const SOP_AUDIT_FIELDS = [
  "sbuSubId",
  "sbuId",
  "pilarId",
  "sopName",
  "sopNumber",
  "effectiveDate",
  "filePath",
  "fileName",
  "fileMime",
  "fileSize",
  "isActive",
  "isDeleted",
] as const;

const getSopAuditSnapshot = (record: Record<string, unknown>) =>
  pickSnapshot(record, SOP_AUDIT_FIELDS as unknown as string[]);

export class ProcedureSopService {
  static async create(requesterId: string, reqBody: CreateProcedureSopRequest) {
    const request = Validation.validate(ProcedureSopValidation.CREATE, reqBody);

    const access = await getProcedureAccess(requesterId);
    assertProcedureCrud(access);

    const sbuSub = await prismaEmployee.em_sbu_sub.findFirst({
      where: {
        id: request.sbuSubId,
        status: "A",
        OR: [{ isDeleted: false }, { isDeleted: null }],
      },
    });

    if (!sbuSub) {
      throw new ResponseError(400, "Invalid SBU Sub");
    }

    const sbuId = sbuSub.sbu_id ?? null;
    const pilarId = sbuSub.sbu_pilar ?? null;
    const baseNumber = getBaseNumber(request.sopNumber);

    const activeExisting = await prismaFlowly.procedureSop.findFirst({
      where: {
        sbuSubId: request.sbuSubId,
        isDeleted: false,
        isActive: true,
        ...buildRevisionWhere("sopNumber", baseNumber),
      },
      orderBy: { effectiveDate: "desc" },
    });

    if (activeExisting && request.effectiveDate <= activeExisting.effectiveDate) {
      throw new ResponseError(400, "effectiveDate must be newer than active SOP");
    }

    const sopId = await generateProcedureSopId();
    const now = new Date();

    const { created, deactivatedIds, deactivatedIkCount } =
      await prismaFlowly.$transaction(async (tx) => {
        const toDeactivate = await tx.procedureSop.findMany({
          where: {
            sbuSubId: request.sbuSubId,
            isDeleted: false,
            isActive: true,
            ...buildRevisionWhere("sopNumber", baseNumber),
          },
        });

        const ids = toDeactivate.map((item) => item.sopId);
        let ikCount = 0;

        if (ids.length > 0) {
          await tx.procedureSop.updateMany({
            where: { sopId: { in: ids } },
            data: {
              isActive: false,
              updatedAt: now,
              updatedBy: requesterId,
            },
          });

          const ikResult = await tx.procedureIk.updateMany({
            where: {
              sopId: { in: ids },
              isDeleted: false,
              isActive: true,
            },
            data: {
              isActive: false,
              updatedAt: now,
              updatedBy: requesterId,
            },
          });
          ikCount = ikResult.count;
        }

        const created = await tx.procedureSop.create({
          data: {
            sopId,
            sbuSubId: request.sbuSubId,
            sbuId,
            pilarId,
            sopName: request.sopName,
            sopNumber: request.sopNumber.trim(),
            effectiveDate: request.effectiveDate,
            filePath: request.filePath,
            fileName: request.fileName,
            fileMime: request.fileMime ?? null,
            fileSize: request.fileSize ?? null,
            isActive: true,
            isDeleted: false,
            createdBy: requesterId,
            updatedBy: requesterId,
          },
        });

        return { created, deactivatedIds: ids, deactivatedIkCount: ikCount };
      });

    if (deactivatedIds.length > 0) {
      await writeAuditLog({
        module: "PROCEDURE",
        entity: "SOP",
        entityId: created.sopId,
        action: "AUTO_DEACTIVATE",
        actorId: requesterId,
        actorType: access.actorType,
        meta: {
          sopIds: deactivatedIds,
          ikCount: deactivatedIkCount,
        },
      });
    }

    await writeAuditLog({
      module: "PROCEDURE",
      entity: "SOP",
      entityId: created.sopId,
      action: "CREATE",
      actorId: requesterId,
      actorType: access.actorType,
      snapshot: getSopAuditSnapshot(created as unknown as Record<string, unknown>),
    });

    return toProcedureSopResponse(created);
  }

  static async update(requesterId: string, reqBody: UpdateProcedureSopRequest) {
    const request = Validation.validate(ProcedureSopValidation.UPDATE, reqBody);

    const access = await getProcedureAccess(requesterId);
    assertProcedureCrud(access);

    const existing = await prismaFlowly.procedureSop.findUnique({
      where: { sopId: request.sopId },
    });

    if (!existing || existing.isDeleted) {
      throw new ResponseError(404, "SOP not found");
    }

    if (request.effectiveDate) {
      throw new ResponseError(400, "Use create to add new effective date");
    }

    if (
      request.filePath ||
      request.fileName ||
      request.fileMime !== undefined ||
      request.fileSize !== undefined
    ) {
      throw new ResponseError(400, "Use create to upload a new file");
    }

    const nextSopNumber = request.sopNumber?.trim();

    if (nextSopNumber && nextSopNumber !== existing.sopNumber) {
      if (isRevisionNumber(nextSopNumber, existing.sopNumber)) {
        throw new ResponseError(400, "Use create to revise SOP number");
      }

      const baseNumber = getBaseNumber(nextSopNumber);
      const activeOther = await prismaFlowly.procedureSop.findFirst({
        where: {
          sopId: { not: existing.sopId },
          sbuSubId: existing.sbuSubId,
          isDeleted: false,
          isActive: true,
          ...buildRevisionWhere("sopNumber", baseNumber),
        },
      });

      if (activeOther) {
        throw new ResponseError(400, "Another active SOP with this number exists");
      }
    }

    if (request.isActive === true && existing.isActive === false) {
      const baseNumber = getBaseNumber(existing.sopNumber);
      const activeOther = await prismaFlowly.procedureSop.findFirst({
        where: {
          sopId: { not: existing.sopId },
          sbuSubId: existing.sbuSubId,
          isDeleted: false,
          isActive: true,
          ...buildRevisionWhere("sopNumber", baseNumber),
        },
      });

      if (activeOther) {
        throw new ResponseError(400, "Deactivate other SOP revisions first");
      }
    }

    const before = { ...existing } as Record<string, unknown>;

    const updated = await prismaFlowly.procedureSop.update({
      where: { sopId: request.sopId },
      data: {
        sopName: request.sopName ?? existing.sopName,
        sopNumber: nextSopNumber ?? existing.sopNumber,
        isActive: request.isActive ?? existing.isActive,
        updatedAt: new Date(),
        updatedBy: requesterId,
      },
    });

    let deactivatedIkCount = 0;
    if (request.isActive === false && existing.isActive) {
      const ikResult = await prismaFlowly.procedureIk.updateMany({
        where: {
          sopId: existing.sopId,
          isDeleted: false,
          isActive: true,
        },
        data: {
          isActive: false,
          updatedAt: new Date(),
          updatedBy: requesterId,
        },
      });
      deactivatedIkCount = ikResult.count;
    }

    const changes = buildChanges(
      before,
      updated as unknown as Record<string, unknown>,
      SOP_AUDIT_FIELDS as unknown as string[]
    );

    if (changes.length > 0 || deactivatedIkCount > 0) {
      const payload = {
        module: "PROCEDURE",
        entity: "SOP",
        entityId: updated.sopId,
        action: "UPDATE",
        actorId: requesterId,
        actorType: access.actorType,
        changes,
      } as const;
      const meta = deactivatedIkCount > 0 ? { ikCount: deactivatedIkCount } : undefined;
      await writeAuditLog(meta ? { ...payload, meta } : payload);
    }

    return toProcedureSopResponse(updated);
  }

  static async softDelete(requesterId: string, reqBody: DeleteProcedureSopRequest) {
    const request = Validation.validate(ProcedureSopValidation.DELETE, reqBody);

    const access = await getProcedureAccess(requesterId);
    assertProcedureCrud(access);

    const existing = await prismaFlowly.procedureSop.findUnique({
      where: { sopId: request.sopId },
    });

    if (!existing || existing.isDeleted) {
      throw new ResponseError(404, "SOP not found");
    }

    const now = new Date();

    const { ikDeletedCount } = await prismaFlowly.$transaction(async (tx) => {
      const ikResult = await tx.procedureIk.updateMany({
        where: { sopId: request.sopId, isDeleted: false },
        data: {
          isDeleted: true,
          isActive: false,
          deletedAt: now,
          deletedBy: requesterId,
        },
      });

      await tx.procedureSop.update({
        where: { sopId: request.sopId },
        data: {
          isDeleted: true,
          isActive: false,
          deletedAt: now,
          deletedBy: requesterId,
        },
      });

      return { ikDeletedCount: ikResult.count };
    });

    const payload = {
      module: "PROCEDURE",
      entity: "SOP",
      entityId: existing.sopId,
      action: "DELETE",
      actorId: requesterId,
      actorType: access.actorType,
      snapshot: getSopAuditSnapshot(existing as unknown as Record<string, unknown>),
    } as const;
    const meta = ikDeletedCount > 0 ? { ikCount: ikDeletedCount } : undefined;
    await writeAuditLog(meta ? { ...payload, meta } : payload);

    return { message: "SOP deleted" };
  }

  static async list(
    requesterId: string,
    filters?: {
      sbuSubId?: number;
      sbuId?: number;
      pilarId?: number;
      sopNumber?: string;
    }
  ) {
    await getProcedureAccess(requesterId);

    if (filters?.sbuSubId) {
      const sub = await prismaEmployee.em_sbu_sub.findFirst({
        where: { id: filters.sbuSubId },
        select: { isDeleted: true },
      });

      if (!sub || sub.isDeleted === true) {
        return [];
      }
    }

    const whereClause: any = {
      isDeleted: false,
      isActive: true,
    };

    if (filters?.sbuSubId !== undefined) {
      whereClause.sbuSubId = filters.sbuSubId;
    }
    if (filters?.sbuId !== undefined) {
      whereClause.sbuId = filters.sbuId;
    }
    if (filters?.pilarId !== undefined) {
      whereClause.pilarId = filters.pilarId;
    }
    if (filters?.sopNumber) {
      whereClause.sopNumber = filters.sopNumber;
    }

    const list = await prismaFlowly.procedureSop.findMany({
      where: whereClause,
      orderBy: { effectiveDate: "desc" },
    });

    return list.map(toProcedureSopListResponse);
  }
}
