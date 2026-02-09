import { prismaEmployee, prismaFlowly } from "../application/database.js";
import { Validation } from "../validation/validation.js";
import { FishboneValidation } from "../validation/fishbone-validation.js";
import { ResponseError } from "../error/response-error.js";
import { generateMasterFishboneId } from "../utils/id-generator.js";
import { assertProcedureCrud, getProcedureAccess } from "../utils/procedure-access.js";
import { buildChanges, pickSnapshot, writeAuditLog } from "../utils/audit-log.js";
import type { Prisma } from "../generated/flowly/client.js";

import {
  type CreateFishboneRequest,
  type UpdateFishboneRequest,
  type DeleteFishboneRequest,
  toFishboneResponse,
  toFishboneListResponse,
} from "../model/fishbone-model.js";

const FISHBONE_AUDIT_FIELDS = [
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

export class FishboneService {
  static async create(requesterId: string, reqBody: CreateFishboneRequest) {
    const request = Validation.validate(FishboneValidation.CREATE, reqBody);

    const access = await getProcedureAccess(requesterId);
    assertProcedureCrud(access);

    await ensureSbuSubExists(request.sbuSubId);

    const fishboneId = await generateMasterFishboneId();
    const now = new Date();

    const created = await prismaFlowly.masterFishbone.create({
      data: {
        fishboneId,
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
      module: "FISHBONE",
      entity: "FISHBONE",
      entityId: created.fishboneId,
      action: "CREATE",
      actorId: requesterId,
      actorType: access.actorType,
      snapshot: getFishboneSnapshot(created as unknown as Record<string, unknown>),
    });

    return toFishboneResponse(created);
  }

  static async update(requesterId: string, reqBody: UpdateFishboneRequest) {
    const request = Validation.validate(FishboneValidation.UPDATE, reqBody);

    const access = await getProcedureAccess(requesterId);
    assertProcedureCrud(access);

    const existing = await prismaFlowly.masterFishbone.findUnique({
      where: { fishboneId: request.fishboneId },
    });

    if (!existing || existing.isDeleted) {
      throw new ResponseError(404, "Fishbone not found");
    }

    if (
      request.sbuSubId !== undefined &&
      request.sbuSubId !== existing.sbuSubId
    ) {
      await ensureSbuSubExists(request.sbuSubId);
    }

    const before = { ...existing } as Record<string, unknown>;
    const updateData: Prisma.MasterFishboneUpdateInput = {
      sbuSubId: request.sbuSubId ?? existing.sbuSubId,
      fishboneName: request.fishboneName?.trim() ?? existing.fishboneName,
      isActive: request.isActive ?? existing.isActive,
      updatedAt: new Date(),
      updatedBy: requesterId,
    };

    if (request.fishboneDesc !== undefined) {
      updateData.fishboneDesc = normalizeNullableText(request.fishboneDesc) ?? null;
    }

    const updated = await prismaFlowly.masterFishbone.update({
      where: { fishboneId: request.fishboneId },
      data: updateData,
    });

    const changes = buildChanges(
      before,
      updated as unknown as Record<string, unknown>,
      FISHBONE_AUDIT_FIELDS as unknown as string[]
    );

    if (changes.length > 0) {
      await writeAuditLog({
        module: "FISHBONE",
        entity: "FISHBONE",
        entityId: updated.fishboneId,
        action: "UPDATE",
        actorId: requesterId,
        actorType: access.actorType,
        changes,
      });
    }

    return toFishboneResponse(updated);
  }

  static async softDelete(
    requesterId: string,
    reqBody: DeleteFishboneRequest
  ) {
    const request = Validation.validate(FishboneValidation.DELETE, reqBody);

    const access = await getProcedureAccess(requesterId);
    assertProcedureCrud(access);

    const existing = await prismaFlowly.masterFishbone.findUnique({
      where: { fishboneId: request.fishboneId },
    });

    if (!existing || existing.isDeleted) {
      throw new ResponseError(404, "Fishbone not found");
    }

    const now = new Date();

    const { causeCount, itemCount, linkCount } =
      await prismaFlowly.$transaction(async (tx) => {
        const items = await tx.fishboneItem.findMany({
          where: { fishboneId: request.fishboneId, isDeleted: false },
          select: { fishboneItemId: true },
        });
        const itemIds = items.map((item) => item.fishboneItemId);

        const linkResult =
          itemIds.length > 0
            ? await tx.fishboneItemCause.updateMany({
                where: {
                  fishboneItemId: { in: itemIds },
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

        const causeResult = await tx.fishboneCause.updateMany({
          where: { fishboneId: request.fishboneId, isDeleted: false },
          data: {
            isDeleted: true,
            isActive: false,
            deletedAt: now,
            deletedBy: requesterId,
            updatedAt: now,
            updatedBy: requesterId,
          },
        });

        const itemResult = await tx.fishboneItem.updateMany({
          where: { fishboneId: request.fishboneId, isDeleted: false },
          data: {
            isDeleted: true,
            isActive: false,
            deletedAt: now,
            deletedBy: requesterId,
            updatedAt: now,
            updatedBy: requesterId,
          },
        });

        await tx.masterFishbone.update({
          where: { fishboneId: request.fishboneId },
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

    const meta =
      causeCount > 0 || itemCount > 0 || linkCount > 0
        ? { causeCount, itemCount, linkCount }
        : undefined;

    await writeAuditLog({
      module: "FISHBONE",
      entity: "FISHBONE",
      entityId: existing.fishboneId,
      action: "DELETE",
      actorId: requesterId,
      actorType: access.actorType,
      snapshot: getFishboneSnapshot(existing as unknown as Record<string, unknown>),
      ...(meta ? { meta } : {}),
    });

    return { message: "Fishbone deleted" };
  }

  static async list(
    requesterId: string,
    filters?: {
      fishboneId?: string;
      sbuSubId?: number;
    }
  ) {
    const access = await getProcedureAccess(requesterId);

    if (filters?.fishboneId) {
      const existing = await prismaFlowly.masterFishbone.findUnique({
        where: { fishboneId: filters.fishboneId },
        select: { isDeleted: true, isActive: true },
      });

      if (!existing || existing.isDeleted) {
        return [];
      }
      if (!access.canCrud && !existing.isActive) {
        return [];
      }
    }

    if (filters?.sbuSubId !== undefined) {
      const sbuSub = await prismaEmployee.em_sbu_sub.findFirst({
        where: {
          id: filters.sbuSubId,
          OR: [{ isDeleted: false }, { isDeleted: null }],
        },
        select: { id: true },
      });

      if (!sbuSub) {
        return [];
      }
    }

    const whereClause: Prisma.MasterFishboneWhereInput = {
      isDeleted: false,
      ...(access.canCrud ? {} : { isActive: true }),
      ...(filters?.fishboneId ? { fishboneId: filters.fishboneId } : {}),
      ...(filters?.sbuSubId !== undefined ? { sbuSubId: filters.sbuSubId } : {}),
    };

    const list = await prismaFlowly.masterFishbone.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    return list.map(toFishboneListResponse);
  }
}
