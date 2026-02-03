import { prismaFlowly } from "../application/database.js";
import { Validation } from "../validation/validation.js";
import { ProcedureSopIkValidation } from "../validation/procedure-sop-ik-validation.js";
import { ResponseError } from "../error/response-error.js";
import { generateProcedureSopIkId } from "../utils/id-generator.js";
import { assertProcedureCrud, getProcedureAccess } from "../utils/procedure-access.js";
import { buildChanges, pickSnapshot, writeAuditLog } from "../utils/audit-log.js";
import type { Prisma, ProcedureSopIK } from "../generated/flowly/client.js";

import {
  type CreateProcedureSopIkRequest,
  type UpdateProcedureSopIkRequest,
  type DeleteProcedureSopIkRequest,
  toProcedureSopIkResponse,
  toProcedureSopIkListResponse,
} from "../model/procedure-sop-ik-model.js";

const SOP_IK_AUDIT_FIELDS = ["sopId", "ikId", "isActive", "isDeleted"] as const;

const getSopIkSnapshot = (record: Record<string, unknown>) =>
  pickSnapshot(record, SOP_IK_AUDIT_FIELDS as unknown as string[]);

const normalizeIkIds = (ikIds: string[]) =>
  Array.from(
    new Set(ikIds.map((id) => id.trim()).filter((id) => id.length > 0))
  );

const fetchLinks = async (filters: Prisma.ProcedureSopIKWhereInput) =>
  prismaFlowly.procedureSopIK.findMany({
    where: filters,
    include: {
      masterIK: {
        select: {
          ikId: true,
          ikName: true,
          ikNumber: true,
          effectiveDate: true,
          isActive: true,
        },
      },
      sop: {
        select: {
          sopId: true,
          sopName: true,
          sopNumber: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

export class ProcedureSopIkService {
  static async create(requesterId: string, reqBody: CreateProcedureSopIkRequest) {
    const request = Validation.validate(ProcedureSopIkValidation.CREATE, reqBody);

    const access = await getProcedureAccess(requesterId);
    assertProcedureCrud(access);

    const sop = await prismaFlowly.procedureSop.findUnique({
      where: { sopId: request.sopId },
      select: { sopId: true, isDeleted: true, isActive: true },
    });

    if (!sop || sop.isDeleted) {
      throw new ResponseError(404, "SOP not found");
    }
    if (!sop.isActive) {
      throw new ResponseError(400, "SOP not active");
    }

    const ikIds = normalizeIkIds(request.ikIds);
    if (ikIds.length === 0) {
      throw new ResponseError(400, "ikIds is required");
    }

    const iks = await prismaFlowly.masterIK.findMany({
      where: {
        ikId: { in: ikIds },
        isDeleted: false,
      },
      select: { ikId: true, isActive: true },
    });

    const ikMap = new Map(iks.map((ik) => [ik.ikId, ik]));
    const missingIds = ikIds.filter((id) => !ikMap.has(id));
    if (missingIds.length > 0) {
      throw new ResponseError(404, `IK not found: ${missingIds.join(", ")}`);
    }

    const inactiveIds = iks
      .filter((ik) => !ik.isActive)
      .map((ik) => ik.ikId);
    if (inactiveIds.length > 0) {
      throw new ResponseError(400, `IK not active: ${inactiveIds.join(", ")}`);
    }

    const existingLinks = await prismaFlowly.procedureSopIK.findMany({
      where: {
        sopId: request.sopId,
        ikId: { in: ikIds },
      },
    });

    const existingByIkId = new Map<string, ProcedureSopIK>();
    for (const link of existingLinks) {
      if (!existingByIkId.has(link.ikId)) {
        existingByIkId.set(link.ikId, link);
      }
    }

    const toCreate: string[] = [];
    const toReactivate: ProcedureSopIK[] = [];

    for (const ikId of ikIds) {
      const existing = existingByIkId.get(ikId);
      if (!existing) {
        toCreate.push(ikId);
        continue;
      }
      if (existing.isDeleted || !existing.isActive) {
        toReactivate.push(existing);
      }
    }

    const now = new Date();
    const createId = await generateProcedureSopIkId();
    const createPayloads = toCreate.map((ikId) => ({
      sopIkId: createId(),
      sopId: request.sopId,
      ikId,
      isActive: true,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
      createdBy: requesterId,
      updatedBy: requesterId,
    }));

    await prismaFlowly.$transaction(async (tx) => {
      if (toReactivate.length > 0) {
        await tx.procedureSopIK.updateMany({
          where: { sopIkId: { in: toReactivate.map((link) => link.sopIkId) } },
          data: {
            isDeleted: false,
            isActive: true,
            deletedAt: null,
            deletedBy: null,
            updatedAt: now,
            updatedBy: requesterId,
          },
        });
      }

      if (createPayloads.length > 0) {
        await tx.procedureSopIK.createMany({
          data: createPayloads,
        });
      }
    });

    for (const payload of createPayloads) {
      await writeAuditLog({
        module: "PROCEDURE",
        entity: "SOP_IK",
        entityId: payload.sopIkId,
        action: "CREATE",
        actorId: requesterId,
        actorType: access.actorType,
        snapshot: getSopIkSnapshot(payload as unknown as Record<string, unknown>),
        meta: { sopId: payload.sopId, ikId: payload.ikId },
      });
    }

    for (const link of toReactivate) {
      const after = {
        ...link,
        isDeleted: false,
        isActive: true,
        deletedAt: null,
        deletedBy: null,
      } as Record<string, unknown>;
      const changes = buildChanges(
        link as unknown as Record<string, unknown>,
        after,
        SOP_IK_AUDIT_FIELDS as unknown as string[]
      );
      if (changes.length > 0) {
        await writeAuditLog({
          module: "PROCEDURE",
          entity: "SOP_IK",
          entityId: link.sopIkId,
          action: "UPDATE",
          actorId: requesterId,
          actorType: access.actorType,
          changes,
          meta: { sopId: link.sopId, ikId: link.ikId },
        });
      }
    }

    const linked = await fetchLinks({
      sopId: request.sopId,
      ikId: { in: ikIds },
      isDeleted: false,
      isActive: true,
    });

    return linked.map(toProcedureSopIkListResponse);
  }

  static async update(requesterId: string, reqBody: UpdateProcedureSopIkRequest) {
    const request = Validation.validate(ProcedureSopIkValidation.UPDATE, reqBody);

    const access = await getProcedureAccess(requesterId);
    assertProcedureCrud(access);

    const existing = await prismaFlowly.procedureSopIK.findUnique({
      where: { sopIkId: request.sopIkId },
      include: {
        masterIK: {
          select: {
            ikId: true,
            ikName: true,
            ikNumber: true,
            effectiveDate: true,
            isActive: true,
          },
        },
        sop: {
          select: {
            sopId: true,
            sopName: true,
            sopNumber: true,
          },
        },
      },
    });

    if (!existing || existing.isDeleted) {
      throw new ResponseError(404, "SOP IK not found");
    }

    const nextIsActive = request.isActive ?? existing.isActive;
    const now = new Date();

    const updated = await prismaFlowly.procedureSopIK.update({
      where: { sopIkId: request.sopIkId },
      data: {
        isActive: nextIsActive,
        updatedAt: now,
        updatedBy: requesterId,
      },
      include: {
        masterIK: {
          select: {
            ikId: true,
            ikName: true,
            ikNumber: true,
            effectiveDate: true,
            isActive: true,
          },
        },
        sop: {
          select: {
            sopId: true,
            sopName: true,
            sopNumber: true,
          },
        },
      },
    });

    const changes = buildChanges(
      existing as unknown as Record<string, unknown>,
      updated as unknown as Record<string, unknown>,
      SOP_IK_AUDIT_FIELDS as unknown as string[]
    );

    if (changes.length > 0) {
      await writeAuditLog({
        module: "PROCEDURE",
        entity: "SOP_IK",
        entityId: updated.sopIkId,
        action: "UPDATE",
        actorId: requesterId,
        actorType: access.actorType,
        changes,
        meta: { sopId: updated.sopId, ikId: updated.ikId },
      });
    }

    return toProcedureSopIkResponse(updated);
  }

  static async softDelete(
    requesterId: string,
    reqBody: DeleteProcedureSopIkRequest
  ) {
    const request = Validation.validate(ProcedureSopIkValidation.DELETE, reqBody);

    const access = await getProcedureAccess(requesterId);
    assertProcedureCrud(access);

    const existing = await prismaFlowly.procedureSopIK.findUnique({
      where: { sopIkId: request.sopIkId },
    });

    if (!existing || existing.isDeleted) {
      throw new ResponseError(404, "SOP IK not found");
    }

    const now = new Date();
    await prismaFlowly.procedureSopIK.update({
      where: { sopIkId: request.sopIkId },
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
      module: "PROCEDURE",
      entity: "SOP_IK",
      entityId: existing.sopIkId,
      action: "DELETE",
      actorId: requesterId,
      actorType: access.actorType,
      snapshot: getSopIkSnapshot(existing as unknown as Record<string, unknown>),
      meta: { sopId: existing.sopId, ikId: existing.ikId },
    });

    return { message: "SOP IK deleted" };
  }

  static async list(
    requesterId: string,
    filters?: {
      sopId?: string;
      ikId?: string;
    }
  ) {
    const access = await getProcedureAccess(requesterId);

    if (filters?.sopId) {
      const sop = await prismaFlowly.procedureSop.findUnique({
        where: { sopId: filters.sopId },
        select: { isDeleted: true, isActive: true },
      });
      if (!sop || sop.isDeleted || (!access.canCrud && !sop.isActive)) {
        return [];
      }
    }

    if (filters?.ikId) {
      const ik = await prismaFlowly.masterIK.findUnique({
        where: { ikId: filters.ikId },
        select: { isDeleted: true, isActive: true },
      });
      if (!ik || ik.isDeleted || (!access.canCrud && !ik.isActive)) {
        return [];
      }
    }

    const whereClause: Prisma.ProcedureSopIKWhereInput = {
      isDeleted: false,
      ...(access.canCrud ? {} : { isActive: true }),
      ...(filters?.sopId ? { sopId: filters.sopId } : {}),
      ...(filters?.ikId ? { ikId: filters.ikId } : {}),
      sop: {
        isDeleted: false,
        ...(access.canCrud ? {} : { isActive: true }),
      },
      masterIK: {
        isDeleted: false,
        ...(access.canCrud ? {} : { isActive: true }),
      },
    };

    const list = await fetchLinks(whereClause);
    return list.map(toProcedureSopIkListResponse);
  }
}
