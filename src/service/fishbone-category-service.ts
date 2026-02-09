import { prismaFlowly } from "../application/database.js";
import { Validation } from "../validation/validation.js";
import { FishboneCategoryValidation } from "../validation/fishbone-category-validation.js";
import { ResponseError } from "../error/response-error.js";
import { generateFishboneCategoryId } from "../utils/id-generator.js";
import { assertProcedureCrud, getProcedureAccess } from "../utils/procedure-access.js";
import { buildChanges, pickSnapshot, writeAuditLog } from "../utils/audit-log.js";
import type { Prisma } from "../generated/flowly/client.js";

import {
  type CreateFishboneCategoryRequest,
  type UpdateFishboneCategoryRequest,
  type DeleteFishboneCategoryRequest,
  toFishboneCategoryResponse,
  toFishboneCategoryListResponse,
} from "../model/fishbone-category-model.js";

const CATEGORY_AUDIT_FIELDS = [
  "categoryCode",
  "categoryName",
  "categoryDesc",
  "isActive",
  "isDeleted",
] as const;

const getCategorySnapshot = (record: Record<string, unknown>) =>
  pickSnapshot(record, CATEGORY_AUDIT_FIELDS as unknown as string[]);

const normalizeCode = (value: string) => value.trim().toUpperCase();

const normalizeName = (value: string) => value.trim();

const normalizeNullableText = (value?: string | null) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const ensureUniqueCode = async (code: string, excludeId?: string) => {
  const existing = await prismaFlowly.fishboneCategory.findFirst({
    where: {
      categoryCode: code,
      ...(excludeId ? { fishboneCategoryId: { not: excludeId } } : {}),
    },
    select: { fishboneCategoryId: true },
  });

  if (existing) {
    throw new ResponseError(400, "Category code already exists");
  }
};

const ensureCategoryUnused = async (categoryCode: string) => {
  const linked = await prismaFlowly.fishboneItem.findFirst({
    where: {
      categoryCode,
      isDeleted: false,
    },
    select: { fishboneItemId: true },
  });

  if (linked) {
    throw new ResponseError(400, "Category code is already used by items");
  }
};

export class FishboneCategoryService {
  static async create(
    requesterId: string,
    reqBody: CreateFishboneCategoryRequest
  ) {
    const request = Validation.validate(FishboneCategoryValidation.CREATE, reqBody);

    const access = await getProcedureAccess(requesterId);
    assertProcedureCrud(access);

    const categoryCode = normalizeCode(request.categoryCode);
    await ensureUniqueCode(categoryCode);

    const fishboneCategoryId = await generateFishboneCategoryId();
    const now = new Date();

    const created = await prismaFlowly.fishboneCategory.create({
      data: {
        fishboneCategoryId,
        categoryCode,
        categoryName: normalizeName(request.categoryName),
        categoryDesc: normalizeNullableText(request.categoryDesc) ?? null,
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
      entity: "FISHBONE_CATEGORY",
      entityId: created.fishboneCategoryId,
      action: "CREATE",
      actorId: requesterId,
      actorType: access.actorType,
      snapshot: getCategorySnapshot(created as unknown as Record<string, unknown>),
    });

    return toFishboneCategoryResponse(created);
  }

  static async update(
    requesterId: string,
    reqBody: UpdateFishboneCategoryRequest
  ) {
    const request = Validation.validate(FishboneCategoryValidation.UPDATE, reqBody);

    const access = await getProcedureAccess(requesterId);
    assertProcedureCrud(access);

    const existing = await prismaFlowly.fishboneCategory.findUnique({
      where: { fishboneCategoryId: request.fishboneCategoryId },
    });

    if (!existing || existing.isDeleted) {
      throw new ResponseError(404, "Fishbone category not found");
    }

    let nextCategoryCode = existing.categoryCode;
    if (request.categoryCode !== undefined) {
      nextCategoryCode = normalizeCode(request.categoryCode);
      if (nextCategoryCode !== existing.categoryCode) {
        await ensureUniqueCode(nextCategoryCode, existing.fishboneCategoryId);
        await ensureCategoryUnused(existing.categoryCode);
      }
    }

    const before = { ...existing } as Record<string, unknown>;
    const updateData: Prisma.FishboneCategoryUpdateInput = {
      categoryCode: nextCategoryCode,
      categoryName:
        request.categoryName !== undefined
          ? normalizeName(request.categoryName)
          : existing.categoryName,
      isActive: request.isActive ?? existing.isActive,
      updatedAt: new Date(),
      updatedBy: requesterId,
    };

    if (request.categoryDesc !== undefined) {
      updateData.categoryDesc = normalizeNullableText(request.categoryDesc) ?? null;
    }

    const updated = await prismaFlowly.fishboneCategory.update({
      where: { fishboneCategoryId: request.fishboneCategoryId },
      data: updateData,
    });

    const changes = buildChanges(
      before,
      updated as unknown as Record<string, unknown>,
      CATEGORY_AUDIT_FIELDS as unknown as string[]
    );

    if (changes.length > 0) {
      await writeAuditLog({
        module: "FISHBONE",
        entity: "FISHBONE_CATEGORY",
        entityId: updated.fishboneCategoryId,
        action: "UPDATE",
        actorId: requesterId,
        actorType: access.actorType,
        changes,
      });
    }

    return toFishboneCategoryResponse(updated);
  }

  static async softDelete(
    requesterId: string,
    reqBody: DeleteFishboneCategoryRequest
  ) {
    const request = Validation.validate(FishboneCategoryValidation.DELETE, reqBody);

    const access = await getProcedureAccess(requesterId);
    assertProcedureCrud(access);

    const existing = await prismaFlowly.fishboneCategory.findUnique({
      where: { fishboneCategoryId: request.fishboneCategoryId },
    });

    if (!existing || existing.isDeleted) {
      throw new ResponseError(404, "Fishbone category not found");
    }

    const now = new Date();

    await prismaFlowly.fishboneCategory.update({
      where: { fishboneCategoryId: request.fishboneCategoryId },
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
      module: "FISHBONE",
      entity: "FISHBONE_CATEGORY",
      entityId: existing.fishboneCategoryId,
      action: "DELETE",
      actorId: requesterId,
      actorType: access.actorType,
      snapshot: getCategorySnapshot(existing as unknown as Record<string, unknown>),
    });

    return { message: "Fishbone category deleted" };
  }

  static async list(
    requesterId: string,
    filters?: {
      categoryCode?: string;
    }
  ) {
    const access = await getProcedureAccess(requesterId);

    const whereClause: Prisma.FishboneCategoryWhereInput = {
      isDeleted: false,
      ...(access.canCrud ? {} : { isActive: true }),
    };

    if (filters?.categoryCode) {
      whereClause.categoryCode = normalizeCode(filters.categoryCode);
    }

    const list = await prismaFlowly.fishboneCategory.findMany({
      where: whereClause,
      orderBy: { categoryCode: "asc" },
    });

    return list.map(toFishboneCategoryListResponse);
  }
}
