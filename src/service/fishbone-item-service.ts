import { prismaFlowly } from "../application/database.js";
import { Validation } from "../validation/validation.js";
import { FishboneItemValidation } from "../validation/fishbone-item-validation.js";
import { ResponseError } from "../error/response-error.js";
import {
  generateFishboneItemId,
  generateFishboneItemCauseId,
} from "../utils/id-generator.js";
import { assertProcedureCrud, getProcedureAccess } from "../utils/procedure-access.js";
import { buildChanges, pickSnapshot, writeAuditLog } from "../utils/audit-log.js";
import type { Prisma, FishboneItemCause } from "../generated/flowly/client.js";

import {
  type CreateFishboneItemRequest,
  type UpdateFishboneItemRequest,
  type DeleteFishboneItemRequest,
  toFishboneItemResponse,
  toFishboneItemListResponse,
} from "../model/fishbone-item-model.js";

const normalizeCategoryCode = (value: string) => value.trim().toUpperCase();

const ensureCategoryExists = async (
  categoryCode: string,
  requireActive = true
) => {
  const category = await prismaFlowly.fishboneCategory.findUnique({
    where: { categoryCode },
    select: { categoryCode: true, isActive: true, isDeleted: true },
  });

  if (!category || category.isDeleted) {
    throw new ResponseError(404, "Fishbone category not found");
  }
  if (requireActive && !category.isActive) {
    throw new ResponseError(400, "Fishbone category not active");
  }
};

const normalizeCauseIds = (causeIds: string[]) =>
  Array.from(
    new Set(causeIds.map((id) => id.trim()).filter((id) => id.length > 0))
  );

const ensureFishboneExists = async (fishboneId: string) => {
  const fishbone = await prismaFlowly.masterFishbone.findUnique({
    where: { fishboneId },
    select: { fishboneId: true, isDeleted: true },
  });

  if (!fishbone || fishbone.isDeleted) {
    throw new ResponseError(404, "Fishbone not found");
  }
};

const ensureCausesExist = async (fishboneId: string, causeIds: string[]) => {
  const normalized = normalizeCauseIds(causeIds);
  if (normalized.length === 0) {
    throw new ResponseError(400, "causeIds is required");
  }

  const causes = await prismaFlowly.fishboneCause.findMany({
    where: {
      fishboneCauseId: { in: normalized },
      fishboneId,
      isDeleted: false,
    },
    select: { fishboneCauseId: true, isActive: true },
  });

  const causeMap = new Map(causes.map((cause) => [cause.fishboneCauseId, cause]));
  const missingIds = normalized.filter((id) => !causeMap.has(id));
  if (missingIds.length > 0) {
    throw new ResponseError(404, `Fishbone cause not found: ${missingIds.join(", ")}`);
  }

  const inactiveIds = causes
    .filter((cause) => !cause.isActive)
    .map((cause) => cause.fishboneCauseId);
  if (inactiveIds.length > 0) {
    throw new ResponseError(400, `Fishbone cause not active: ${inactiveIds.join(", ")}`);
  }

  return normalized;
};

const ITEM_AUDIT_FIELDS = [
  "fishboneId",
  "categoryCode",
  "problemText",
  "solutionText",
  "isActive",
  "isDeleted",
] as const;

const getItemSnapshot = (record: Record<string, unknown>) =>
  pickSnapshot(record, ITEM_AUDIT_FIELDS as unknown as string[]);

const ITEM_CAUSE_AUDIT_FIELDS = [
  "fishboneItemId",
  "fishboneCauseId",
  "isActive",
  "isDeleted",
] as const;

const getItemCauseSnapshot = (record: Record<string, unknown>) =>
  pickSnapshot(record, ITEM_CAUSE_AUDIT_FIELDS as unknown as string[]);

type ItemCauseAuditPayload = {
  created: Array<{
    fishboneItemCauseId: string;
    fishboneItemId: string;
    fishboneCauseId: string;
    isActive: boolean;
    isDeleted: boolean;
  }>;
  reactivated: Array<{ before: Record<string, unknown>; after: Record<string, unknown> }>;
  deleted: Array<Record<string, unknown>>;
};

const syncItemCauseLinks = async (
  fishboneItemId: string,
  causeIds: string[],
  requesterId: string
): Promise<ItemCauseAuditPayload> => {
  const auditPayload: ItemCauseAuditPayload = {
    created: [],
    reactivated: [],
    deleted: [],
  };

  const existingLinks = await prismaFlowly.fishboneItemCause.findMany({
    where: { fishboneItemId },
  });

  const existingByCauseId = new Map<string, FishboneItemCause>();
  for (const link of existingLinks) {
    if (!existingByCauseId.has(link.fishboneCauseId)) {
      existingByCauseId.set(link.fishboneCauseId, link);
    }
  }

  const toCreate: string[] = [];
  const toReactivate: FishboneItemCause[] = [];
  const toDelete: FishboneItemCause[] = [];

  for (const causeId of causeIds) {
    const existing = existingByCauseId.get(causeId);
    if (!existing) {
      toCreate.push(causeId);
      continue;
    }
    if (existing.isDeleted || !existing.isActive) {
      toReactivate.push(existing);
    }
  }

  for (const link of existingLinks) {
    if (!causeIds.includes(link.fishboneCauseId) && !link.isDeleted) {
      toDelete.push(link);
    }
  }

  const now = new Date();
  const createId = await generateFishboneItemCauseId();
  const createPayloads = toCreate.map((fishboneCauseId) => ({
    fishboneItemCauseId: createId(),
    fishboneItemId,
    fishboneCauseId,
    isActive: true,
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
    createdBy: requesterId,
    updatedBy: requesterId,
  }));

  await prismaFlowly.$transaction(async (tx) => {
    if (toReactivate.length > 0) {
      await tx.fishboneItemCause.updateMany({
        where: {
          fishboneItemCauseId: { in: toReactivate.map((link) => link.fishboneItemCauseId) },
        },
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

    if (toDelete.length > 0) {
      await tx.fishboneItemCause.updateMany({
        where: { fishboneItemCauseId: { in: toDelete.map((link) => link.fishboneItemCauseId) } },
        data: {
          isDeleted: true,
          isActive: false,
          deletedAt: now,
          deletedBy: requesterId,
          updatedAt: now,
          updatedBy: requesterId,
        },
      });
    }

    if (createPayloads.length > 0) {
      await tx.fishboneItemCause.createMany({
        data: createPayloads,
      });
    }
  });

  auditPayload.created = createPayloads.map((payload) => ({
    fishboneItemCauseId: payload.fishboneItemCauseId,
    fishboneItemId: payload.fishboneItemId,
    fishboneCauseId: payload.fishboneCauseId,
    isActive: payload.isActive,
    isDeleted: payload.isDeleted,
  }));

  auditPayload.reactivated = toReactivate.map((link) => {
    const after = {
      ...link,
      isDeleted: false,
      isActive: true,
      deletedAt: null,
      deletedBy: null,
    } as Record<string, unknown>;
    return {
      before: link as unknown as Record<string, unknown>,
      after,
    };
  });

  auditPayload.deleted = toDelete.map((link) => link as unknown as Record<string, unknown>);

  return auditPayload;
};

const writeItemCauseAuditLogs = async (
  audit: ItemCauseAuditPayload,
  requesterId: string,
  actorType: "FLOWLY" | "EMPLOYEE"
) => {
  for (const payload of audit.created) {
    await writeAuditLog({
      module: "FISHBONE",
      entity: "FISHBONE_ITEM_CAUSE",
      entityId: payload.fishboneItemCauseId,
      action: "CREATE",
      actorId: requesterId,
      actorType,
      snapshot: getItemCauseSnapshot(payload as unknown as Record<string, unknown>),
      meta: { fishboneItemId: payload.fishboneItemId },
    });
  }

  for (const change of audit.reactivated) {
    const changes = buildChanges(
      change.before,
      change.after,
      ITEM_CAUSE_AUDIT_FIELDS as unknown as string[]
    );
    if (changes.length > 0) {
      await writeAuditLog({
        module: "FISHBONE",
        entity: "FISHBONE_ITEM_CAUSE",
        entityId: String(change.before.fishboneItemCauseId),
        action: "UPDATE",
        actorId: requesterId,
        actorType,
        changes,
        meta: {
          fishboneItemId: change.before.fishboneItemId,
          fishboneCauseId: change.before.fishboneCauseId,
        },
      });
    }
  }

  for (const payload of audit.deleted) {
    await writeAuditLog({
      module: "FISHBONE",
      entity: "FISHBONE_ITEM_CAUSE",
      entityId: String(payload.fishboneItemCauseId),
      action: "DELETE",
      actorId: requesterId,
      actorType,
      snapshot: getItemCauseSnapshot(payload),
      meta: {
        fishboneItemId: payload.fishboneItemId,
        fishboneCauseId: payload.fishboneCauseId,
      },
    });
  }
};

export class FishboneItemService {
  static async create(requesterId: string, reqBody: CreateFishboneItemRequest) {
    const request = Validation.validate(FishboneItemValidation.CREATE, reqBody);

    const access = await getProcedureAccess(requesterId);
    assertProcedureCrud(access);

    await ensureFishboneExists(request.fishboneId);

    const normalizedCauseIds = await ensureCausesExist(
      request.fishboneId,
      request.causeIds
    );

    const fishboneItemId = (await generateFishboneItemId())();
    const now = new Date();
    const categoryCode = normalizeCategoryCode(request.categoryCode);
    await ensureCategoryExists(categoryCode, true);

    const createLinkId = await generateFishboneItemCauseId();
    const linkPayloads = normalizedCauseIds.map((fishboneCauseId) => ({
      fishboneItemCauseId: createLinkId(),
      fishboneItemId,
      fishboneCauseId,
      isActive: true,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
      createdBy: requesterId,
      updatedBy: requesterId,
    }));

    await prismaFlowly.$transaction(async (tx) => {
      await tx.fishboneItem.create({
        data: {
          fishboneItemId,
          master_fishbone: { connect: { fishboneId: request.fishboneId } },
          category: { connect: { categoryCode } },
          problemText: request.problemText.trim(),
          solutionText: request.solutionText.trim(),
          isActive: true,
          isDeleted: false,
          createdAt: now,
          updatedAt: now,
          createdBy: requesterId,
          updatedBy: requesterId,
        },
      });

      if (linkPayloads.length > 0) {
        await tx.fishboneItemCause.createMany({
          data: linkPayloads,
        });
      }
    });

    await writeAuditLog({
      module: "FISHBONE",
      entity: "FISHBONE_ITEM",
      entityId: fishboneItemId,
      action: "CREATE",
      actorId: requesterId,
      actorType: access.actorType,
      snapshot: getItemSnapshot({
        fishboneId: request.fishboneId,
        categoryCode,
        problemText: request.problemText.trim(),
        solutionText: request.solutionText.trim(),
        isActive: true,
        isDeleted: false,
      } as Record<string, unknown>),
    });

    if (linkPayloads.length > 0) {
      for (const payload of linkPayloads) {
        await writeAuditLog({
          module: "FISHBONE",
          entity: "FISHBONE_ITEM_CAUSE",
          entityId: payload.fishboneItemCauseId,
          action: "CREATE",
          actorId: requesterId,
          actorType: access.actorType,
          snapshot: getItemCauseSnapshot(payload as unknown as Record<string, unknown>),
          meta: { fishboneItemId },
        });
      }
    }

    const created = await prismaFlowly.fishboneItem.findUnique({
      where: { fishboneItemId },
      include: {
        causeLinks: {
          where: { isDeleted: false },
          include: {
            cause: {
              select: {
                fishboneCauseId: true,
                causeNo: true,
                causeText: true,
                isActive: true,
                isDeleted: true,
              },
            },
          },
        },
      },
    });

    if (!created) {
      throw new ResponseError(500, "Failed to create fishbone item");
    }

    return toFishboneItemResponse(created);
  }

  static async update(requesterId: string, reqBody: UpdateFishboneItemRequest) {
    const request = Validation.validate(FishboneItemValidation.UPDATE, reqBody);

    const access = await getProcedureAccess(requesterId);
    assertProcedureCrud(access);

    const existing = await prismaFlowly.fishboneItem.findUnique({
      where: { fishboneItemId: request.fishboneItemId },
    });

    if (!existing || existing.isDeleted) {
      throw new ResponseError(404, "Fishbone item not found");
    }

    let normalizedCauseIds: string[] | undefined;
    if (request.causeIds !== undefined) {
      normalizedCauseIds = await ensureCausesExist(
        existing.fishboneId,
        request.causeIds
      );
    }

    const before = { ...existing } as Record<string, unknown>;
    const nextCategoryCode = 
      request.categoryCode !== undefined
        ? normalizeCategoryCode(request.categoryCode)
        : existing.categoryCode;

    if (request.categoryCode !== undefined) {
      await ensureCategoryExists(nextCategoryCode, true);
    }

    const updateData: Prisma.FishboneItemUpdateInput = {
      problemText:
        request.problemText !== undefined
          ? request.problemText.trim()
          : existing.problemText,
      solutionText:
        request.solutionText !== undefined
          ? request.solutionText.trim()
          : existing.solutionText,
      isActive: request.isActive ?? existing.isActive,
      updatedAt: new Date(),
      updatedBy: requesterId,
    };

    if (request.categoryCode !== undefined) {
      updateData.category = { connect: { categoryCode: nextCategoryCode } };
    }

    const updated = await prismaFlowly.fishboneItem.update({
      where: { fishboneItemId: request.fishboneItemId },
      data: updateData,
    });

    const changes = buildChanges(
      before,
      updated as unknown as Record<string, unknown>,
      ITEM_AUDIT_FIELDS as unknown as string[]
    );

    if (changes.length > 0) {
      await writeAuditLog({
        module: "FISHBONE",
        entity: "FISHBONE_ITEM",
        entityId: updated.fishboneItemId,
        action: "UPDATE",
        actorId: requesterId,
        actorType: access.actorType,
        changes,
      });
    }

    if (normalizedCauseIds) {
      const auditPayload = await syncItemCauseLinks(
        updated.fishboneItemId,
        normalizedCauseIds,
        requesterId
      );
      await writeItemCauseAuditLogs(auditPayload, requesterId, access.actorType);
    }

    const refreshed = await prismaFlowly.fishboneItem.findUnique({
      where: { fishboneItemId: updated.fishboneItemId },
      include: {
        causeLinks: {
          where: { isDeleted: false },
          include: {
            cause: {
              select: {
                fishboneCauseId: true,
                causeNo: true,
                causeText: true,
                isActive: true,
                isDeleted: true,
              },
            },
          },
        },
      },
    });

    if (!refreshed) {
      throw new ResponseError(500, "Failed to load fishbone item");
    }

    return toFishboneItemResponse(refreshed);
  }

  static async softDelete(
    requesterId: string,
    reqBody: DeleteFishboneItemRequest
  ) {
    const request = Validation.validate(FishboneItemValidation.DELETE, reqBody);

    const access = await getProcedureAccess(requesterId);
    assertProcedureCrud(access);

    const existing = await prismaFlowly.fishboneItem.findUnique({
      where: { fishboneItemId: request.fishboneItemId },
    });

    if (!existing || existing.isDeleted) {
      throw new ResponseError(404, "Fishbone item not found");
    }

    const now = new Date();

    const { linkCount } = await prismaFlowly.$transaction(async (tx) => {
      const linkResult = await tx.fishboneItemCause.updateMany({
        where: { fishboneItemId: request.fishboneItemId, isDeleted: false },
        data: {
          isDeleted: true,
          isActive: false,
          deletedAt: now,
          deletedBy: requesterId,
          updatedAt: now,
          updatedBy: requesterId,
        },
      });

      await tx.fishboneItem.update({
        where: { fishboneItemId: request.fishboneItemId },
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

    const payload = {
      module: "FISHBONE",
      entity: "FISHBONE_ITEM",
      entityId: existing.fishboneItemId,
      action: "DELETE",
      actorId: requesterId,
      actorType: access.actorType,
      snapshot: getItemSnapshot(existing as unknown as Record<string, unknown>),
    } as const;

    await writeAuditLog(
      linkCount > 0 ? { ...payload, meta: { linkCount } } : payload
    );

    return { message: "Fishbone item deleted" };
  }

  static async list(
    requesterId: string,
    filters?: {
      fishboneId?: string;
      categoryCode?: string;
    }
  ) {
    const access = await getProcedureAccess(requesterId);

    if (filters?.fishboneId) {
      const fishbone = await prismaFlowly.masterFishbone.findUnique({
        where: { fishboneId: filters.fishboneId },
        select: { isDeleted: true, isActive: true },
      });

      if (!fishbone || fishbone.isDeleted) {
        return [];
      }
      if (!access.canCrud && !fishbone.isActive) {
        return [];
      }
    }

    const categoryCode =
      filters?.categoryCode !== undefined
        ? normalizeCategoryCode(filters.categoryCode)
        : undefined;

    if (categoryCode) {
      const category = await prismaFlowly.fishboneCategory.findUnique({
        where: { categoryCode },
        select: { isActive: true, isDeleted: true },
      });

      if (!category || category.isDeleted) {
        return [];
      }
      if (!access.canCrud && !category.isActive) {
        return [];
      }
    }

    const whereClause: Prisma.FishboneItemWhereInput = {
      isDeleted: false,
      ...(access.canCrud ? {} : { isActive: true }),
      ...(filters?.fishboneId ? { fishboneId: filters.fishboneId } : {}),
      ...(categoryCode ? { categoryCode } : {}),
      ...(access.canCrud
        ? {}
        : {
            category: {
              isActive: true,
              isDeleted: false,
            },
          }),
    };

    const linkWhere: Prisma.FishboneItemCauseWhereInput = {
      isDeleted: false,
      ...(access.canCrud ? {} : { isActive: true }),
    };

    const list = await prismaFlowly.fishboneItem.findMany({
      where: whereClause,
      include: {
        causeLinks: {
          where: {
            ...linkWhere,
            ...(access.canCrud
              ? {}
              : {
                  cause: {
                    isActive: true,
                    isDeleted: false,
                  },
                }),
          },
          include: {
            cause: {
              select: {
                fishboneCauseId: true,
                causeNo: true,
                causeText: true,
                isActive: true,
                isDeleted: true,
              },
            },
          },
        },
      },
      orderBy: [{ categoryCode: "asc" }, { createdAt: "asc" }],
    });

    return list.map(toFishboneItemListResponse);
  }
}
