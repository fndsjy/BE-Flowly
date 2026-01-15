import { prismaFlowly } from "../application/database.js";
import { Validation } from "../validation/validation.js";
import { MasterAccessRoleValidation } from "../validation/master-access-role-validation.js";
import { ResponseError } from "../error/response-error.js";
import { generatemasAccessId } from "../utils/id-generator.js";
import type { Prisma } from "../generated/flowly/client.js";

import {
  type CreateMasterAccessRoleRequest,
  type UpdateMasterAccessRoleRequest,
  type DeleteMasterAccessRoleRequest,
  toMasterAccessRoleResponse,
  toMasterAccessRoleListResponse
} from "../model/master-access-role-model.js";

const normalizeUpper = (value?: string | null) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.toUpperCase() : null;
};

const normalizeRequiredUpper = (value: string) => value.trim().toUpperCase();

type MasterAccessRoleClient = Prisma.TransactionClient | typeof prismaFlowly;

const buildGroupWhere = (resourceType: string, parentKey: string | null, excludeId?: string) => {
  const where: {
    isDeleted: false;
    resourceType: string;
    parentKey: string | null;
    masAccessId?: { not: string };
  } = {
    isDeleted: false,
    resourceType,
    parentKey,
  };

  if (excludeId) {
    where.masAccessId = { not: excludeId };
  }

  return where;
};

const ensureUniqueOrderIndex = async (
  tx: MasterAccessRoleClient,
  resourceType: string,
  parentKey: string | null
) => {
  const rows = await tx.masterAccessRole.findMany({
    where: buildGroupWhere(resourceType, parentKey),
    select: { masAccessId: true, orderIndex: true }
  });

  const seen = new Map<number, string>();
  for (const row of rows) {
    const existingId = seen.get(row.orderIndex);
    if (existingId && existingId !== row.masAccessId) {
      throw new ResponseError(400, "Duplicate orderIndex detected for the same parent");
    }
    seen.set(row.orderIndex, row.masAccessId);
  }
};

const getMaxOrderIndex = async (
  tx: MasterAccessRoleClient,
  resourceType: string,
  parentKey: string | null,
  excludeId?: string
) => {
  const last = await tx.masterAccessRole.findFirst({
    where: buildGroupWhere(resourceType, parentKey, excludeId),
    orderBy: { orderIndex: "desc" },
    select: { orderIndex: true }
  });

  if (!last) {
    return 10;
  }

  return last.orderIndex ?? 0;
};

export class MasterAccessRoleService {
  static async create(requesterId: string, reqBody: CreateMasterAccessRoleRequest) {
    const req = Validation.validate(MasterAccessRoleValidation.CREATE, reqBody);

    const requester = await prismaFlowly.user.findUnique({
      where: { userId: requesterId },
      include: { role: true }
    });

    if (!requester || requester.role.roleLevel !== 1) {
      throw new ResponseError(403, "Only admin can create master access role");
    }

    const resourceType = normalizeRequiredUpper(req.resourceType);
    const resourceKey = normalizeRequiredUpper(req.resourceKey);
    const parentKey = normalizeUpper(req.parentKey) ?? null;

    const existing = await prismaFlowly.masterAccessRole.findUnique({
      where: {
        resourceType_resourceKey: {
          resourceType,
          resourceKey
        }
      }
    });

    if (existing) {
      throw new ResponseError(400, "Master access role already exists");
    }

    if (parentKey) {
      const parent = await prismaFlowly.masterAccessRole.findFirst({
        where: {
          resourceKey: parentKey,
          isDeleted: false
        },
        select: { masAccessId: true }
      });

      if (!parent) {
        throw new ResponseError(400, "Parent resource not found");
      }
    }

    await ensureUniqueOrderIndex(prismaFlowly, resourceType, parentKey);

    const createId = await generatemasAccessId();
    const now = new Date();
    const lastOrder = await prismaFlowly.masterAccessRole.findFirst({
      where: {
        resourceType,
        parentKey,
        isDeleted: false
      },
      orderBy: { orderIndex: "desc" },
      select: { orderIndex: true }
    });

    const nextOrderIndex = (lastOrder?.orderIndex ?? 0) + 10;
    const created = await prismaFlowly.masterAccessRole.create({
      data: {
        masAccessId: createId(),
        resourceType,
        resourceKey,
        displayName: req.displayName,
        route: req.route ?? null,
        parentKey,
        orderIndex: nextOrderIndex,
        isActive: true,
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
        createdBy: requesterId,
        updatedBy: requesterId
      }
    });

    return toMasterAccessRoleResponse(created);
  }

  static async update(requesterId: string, reqBody: UpdateMasterAccessRoleRequest) {
    const req = Validation.validate(MasterAccessRoleValidation.UPDATE, reqBody);

    const requester = await prismaFlowly.user.findUnique({
      where: { userId: requesterId },
      include: { role: true }
    });

    if (!requester || requester.role.roleLevel !== 1) {
      throw new ResponseError(403, "Only admin can update master access role");
    }

    const existing = await prismaFlowly.masterAccessRole.findUnique({
      where: { masAccessId: req.masAccessId }
    });

    if (!existing || existing.isDeleted) {
      throw new ResponseError(404, "Master access role not found");
    }

    const existingResourceType = normalizeRequiredUpper(existing.resourceType);
    const existingParentKey = normalizeUpper(existing.parentKey) ?? null;
    const finalResourceType = normalizeRequiredUpper(req.resourceType ?? existing.resourceType);
    const finalResourceKey = normalizeRequiredUpper(req.resourceKey ?? existing.resourceKey);
    const finalParentKey = req.parentKey === undefined
      ? existingParentKey
      : (normalizeUpper(req.parentKey) ?? null);

    const conflict = await prismaFlowly.masterAccessRole.findFirst({
      where: {
        resourceType: finalResourceType,
        resourceKey: finalResourceKey,
        masAccessId: { not: req.masAccessId }
      },
      select: { masAccessId: true }
    });

    if (conflict) {
      throw new ResponseError(400, "Resource type/key already exists");
    }

    if (finalParentKey) {
      const parent = await prismaFlowly.masterAccessRole.findFirst({
        where: {
          resourceKey: finalParentKey,
          isDeleted: false
        },
        select: { masAccessId: true }
      });

      if (!parent) {
        throw new ResponseError(400, "Parent resource not found");
      }
    }

    const groupChanged = existingResourceType !== finalResourceType
      || existingParentKey !== finalParentKey;
    let targetOrderIndex = req.orderIndex ?? existing.orderIndex;
    const now = new Date();

    const updated = await prismaFlowly.$transaction(async (tx) => {
      await ensureUniqueOrderIndex(tx, existingResourceType, existingParentKey);
      if (groupChanged) {
        await ensureUniqueOrderIndex(tx, finalResourceType, finalParentKey);
      }

      if (req.orderIndex !== undefined) {
        const maxAllowed = await getMaxOrderIndex(
          tx,
          finalResourceType,
          finalParentKey,
          groupChanged ? req.masAccessId : undefined
        );
        if (req.orderIndex > maxAllowed) {
          throw new ResponseError(400, `orderIndex cannot exceed ${maxAllowed}`);
        }
      }

      if (groupChanged) {
        await tx.masterAccessRole.updateMany({
          where: {
            isDeleted: false,
            resourceType: existingResourceType,
            parentKey: existingParentKey,
            orderIndex: { gt: existing.orderIndex },
            masAccessId: { not: req.masAccessId }
          },
          data: {
            orderIndex: { decrement: 10 },
            updatedAt: now,
            updatedBy: requesterId
          }
        });

        if (req.orderIndex === undefined) {
          const lastOrder = await tx.masterAccessRole.findFirst({
            where: {
              resourceType: finalResourceType,
              parentKey: finalParentKey,
              isDeleted: false
            },
            orderBy: { orderIndex: "desc" },
            select: { orderIndex: true }
          });
          targetOrderIndex = (lastOrder?.orderIndex ?? 0) + 10;
        } else {
          await tx.masterAccessRole.updateMany({
            where: {
              isDeleted: false,
              resourceType: finalResourceType,
              parentKey: finalParentKey,
              orderIndex: { gte: targetOrderIndex },
              masAccessId: { not: req.masAccessId }
            },
            data: {
              orderIndex: { increment: 10 },
              updatedAt: now,
              updatedBy: requesterId
            }
          });
        }
      } else if (req.orderIndex !== undefined && req.orderIndex !== existing.orderIndex) {
        if (targetOrderIndex < existing.orderIndex) {
          await tx.masterAccessRole.updateMany({
            where: {
              isDeleted: false,
              resourceType: existingResourceType,
              parentKey: existingParentKey,
              orderIndex: { gte: targetOrderIndex, lt: existing.orderIndex },
              masAccessId: { not: req.masAccessId }
            },
            data: {
              orderIndex: { increment: 10 },
              updatedAt: now,
              updatedBy: requesterId
            }
          });
        } else {
          await tx.masterAccessRole.updateMany({
            where: {
              isDeleted: false,
              resourceType: existingResourceType,
              parentKey: existingParentKey,
              orderIndex: { gt: existing.orderIndex, lte: targetOrderIndex },
              masAccessId: { not: req.masAccessId }
            },
            data: {
              orderIndex: { decrement: 10 },
              updatedAt: now,
              updatedBy: requesterId
            }
          });
        }
      }

      return tx.masterAccessRole.update({
        where: { masAccessId: req.masAccessId },
        data: {
          resourceType: finalResourceType,
          resourceKey: finalResourceKey,
          displayName: req.displayName ?? existing.displayName,
          route: req.route === undefined ? existing.route : req.route,
          parentKey: req.parentKey === undefined ? existingParentKey : finalParentKey,
          orderIndex: targetOrderIndex,
          isActive: req.isActive ?? existing.isActive,
          updatedAt: now,
          updatedBy: requesterId
        }
      });
    });

    return toMasterAccessRoleResponse(updated);
  }

  static async softDelete(requesterId: string, reqBody: DeleteMasterAccessRoleRequest) {
    const req = Validation.validate(MasterAccessRoleValidation.DELETE, reqBody);

    const requester = await prismaFlowly.user.findUnique({
      where: { userId: requesterId },
      include: { role: true }
    });

    if (!requester || requester.role.roleLevel !== 1) {
      throw new ResponseError(403, "Only admin can delete master access role");
    }

    const existing = await prismaFlowly.masterAccessRole.findUnique({
      where: { masAccessId: req.masAccessId }
    });

    if (!existing || existing.isDeleted) {
      throw new ResponseError(404, "Master access role not found");
    }

    const normalizedResourceType = normalizeRequiredUpper(existing.resourceType);
    const normalizedParentKey = normalizeUpper(existing.parentKey) ?? null;
    const now = new Date();

    await prismaFlowly.$transaction(async (tx) => {
      await tx.masterAccessRole.update({
        where: { masAccessId: req.masAccessId },
        data: {
          isDeleted: true,
          isActive: false,
          deletedAt: now,
          deletedBy: requesterId,
          updatedAt: now,
          updatedBy: requesterId
        }
      });

      await tx.masterAccessRole.updateMany({
        where: {
          isDeleted: false,
          resourceType: normalizedResourceType,
          parentKey: normalizedParentKey,
          orderIndex: { gt: existing.orderIndex }
        },
        data: {
          orderIndex: { decrement: 10 },
          updatedAt: now,
          updatedBy: requesterId
        }
      });
    });

    return { message: "Master access role deleted" };
  }

  static async list(resourceType?: string, parentKey?: string) {
    const normalizedType = resourceType?.trim();
    const filterType = normalizedType ? normalizedType.toUpperCase() : undefined;
    const normalizedParentKey = parentKey?.trim();
    const filterParentKey = normalizedParentKey === undefined
      ? undefined
      : normalizedParentKey.toUpperCase() === "NULL"
        ? null
        : normalizedParentKey.toUpperCase();
    const list = await prismaFlowly.masterAccessRole.findMany({
      where: {
        isDeleted: false,
        ...(filterType ? { resourceType: filterType } : {}),
        ...(filterParentKey === undefined ? {} : { parentKey: filterParentKey })
      },
      orderBy: [
        { resourceType: "asc" },
        { orderIndex: "asc" },
        { displayName: "asc" }
      ]
    });

    return list.map(toMasterAccessRoleListResponse);
  }
}
