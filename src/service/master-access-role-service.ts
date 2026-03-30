import { prismaFlowly } from "../application/database.js";
import { Validation } from "../validation/validation.js";
import { MasterAccessRoleValidation } from "../validation/master-access-role-validation.js";
import { ResponseError } from "../error/response-error.js";
import { generatemasAccessId } from "../utils/id-generator.js";
import type { Prisma } from "../generated/flowly/client.js";

import {
  type CreateMasterAccessRoleRequest,
  type DeleteMasterAccessRoleRequest,
  type UpdateMasterAccessRoleRequest,
  toMasterAccessRoleListResponse,
  toMasterAccessRoleResponse,
} from "../model/master-access-role-model.js";

const normalizeUpper = (value?: string | null) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.toUpperCase() : null;
};

const normalizeRequiredUpper = (value: string) => value.trim().toUpperCase();

type MasterAccessRoleClient = Prisma.TransactionClient | typeof prismaFlowly;

const buildGroupWhere = (
  resourceType: string,
  parentKey: string | null,
  excludeId?: string
) => {
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
    select: { masAccessId: true, orderIndex: true },
  });

  const seen = new Map<number, string>();
  for (const row of rows) {
    const existingId = seen.get(row.orderIndex);
    if (existingId && existingId !== row.masAccessId) {
      throw new ResponseError(
        400,
        "Duplicate orderIndex detected for the same parent"
      );
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
    select: { orderIndex: true },
  });

  if (!last) {
    return 10;
  }

  return last.orderIndex ?? 0;
};

const ensureAdmin = async (requesterId: string) => {
  const requester = await prismaFlowly.user.findUnique({
    where: { userId: requesterId },
    include: { role: true },
  });

  if (!requester || requester.role.roleLevel !== 1) {
    throw new ResponseError(403, "Only admin can manage master access role");
  }
};

const ensureParentExists = async (parentKey: string | null) => {
  if (!parentKey) {
    return;
  }

  const parent = await prismaFlowly.masterAccessRole.findFirst({
    where: {
      resourceKey: parentKey,
      isDeleted: false,
    },
    select: { masAccessId: true },
  });

  if (!parent) {
    throw new ResponseError(400, "Parent resource not found");
  }
};

const findActivePortalMenuMapping = async (
  resourceType: string,
  masAccessId: string
) => {
  if (resourceType === "PORTAL") {
    return prismaFlowly.portalMenuMap.findFirst({
      where: {
        portalMasAccessId: masAccessId,
        isDeleted: false,
      },
      select: { portalMenuMapId: true },
    });
  }

  if (resourceType === "MENU") {
    return prismaFlowly.portalMenuMap.findFirst({
      where: {
        menuMasAccessId: masAccessId,
        isDeleted: false,
      },
      select: { portalMenuMapId: true },
    });
  }

  return null;
};

const resolvePortalScope = async (portalKey?: string) => {
  const normalizedPortalKey = normalizeUpper(portalKey) ?? null;
  if (!normalizedPortalKey) {
    return null;
  }

  const portal = await prismaFlowly.masterAccessRole.findUnique({
    where: {
      resourceType_resourceKey: {
        resourceType: "PORTAL",
        resourceKey: normalizedPortalKey,
      },
    },
    select: {
      masAccessId: true,
      resourceKey: true,
      isActive: true,
      isDeleted: true,
    },
  });

  if (!portal || portal.isDeleted || !portal.isActive) {
    return null;
  }

  const mappings = await prismaFlowly.portalMenuMap.findMany({
    where: {
      portalMasAccessId: portal.masAccessId,
      isDeleted: false,
      isActive: true,
    },
    select: {
      menuMasAccessId: true,
      orderIndex: true,
      menu: {
        select: {
          masAccessId: true,
          resourceKey: true,
          isDeleted: true,
        },
      },
    },
  });

  const filteredMappings = mappings.filter(
    (mapping) => mapping.menu && !mapping.menu.isDeleted
  );
  const menuIds = filteredMappings.map((mapping) => mapping.menuMasAccessId);
  const menuKeys = filteredMappings
    .map((mapping) => mapping.menu?.resourceKey ?? null)
    .filter((value): value is string => Boolean(value));
  const menuOrderById = new Map(
    filteredMappings.map((mapping) => [mapping.menuMasAccessId, mapping.orderIndex])
  );
  const menuOrderByKey = new Map(
    filteredMappings
      .filter((mapping) => mapping.menu?.resourceKey)
      .map((mapping) => [mapping.menu?.resourceKey as string, mapping.orderIndex])
  );

  return {
    portalMasAccessId: portal.masAccessId,
    menuIds,
    menuKeys,
    menuOrderById,
    menuOrderByKey,
  };
};

const sortPortalScopedRoles = (
  items: Array<{
    masAccessId: string;
    resourceType: string;
    parentKey: string | null;
    orderIndex: number;
    displayName: string;
  }>,
  filterType: string | undefined,
  menuOrderById: Map<string, number>,
  menuOrderByKey: Map<string, number>
) => {
  return [...items].sort((left, right) => {
    if (filterType === "MENU") {
      const leftOrder = menuOrderById.get(left.masAccessId) ?? left.orderIndex;
      const rightOrder = menuOrderById.get(right.masAccessId) ?? right.orderIndex;
      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }
      return left.displayName.localeCompare(right.displayName);
    }

    if (filterType === "MODULE") {
      const leftParentOrder =
        menuOrderByKey.get(left.parentKey ?? "") ?? Number.MAX_SAFE_INTEGER;
      const rightParentOrder =
        menuOrderByKey.get(right.parentKey ?? "") ?? Number.MAX_SAFE_INTEGER;
      if (leftParentOrder !== rightParentOrder) {
        return leftParentOrder - rightParentOrder;
      }
      if (left.orderIndex !== right.orderIndex) {
        return left.orderIndex - right.orderIndex;
      }
      return left.displayName.localeCompare(right.displayName);
    }

    if (left.resourceType !== right.resourceType) {
      return left.resourceType.localeCompare(right.resourceType);
    }

    if (left.resourceType === "MENU") {
      const leftOrder = menuOrderById.get(left.masAccessId) ?? left.orderIndex;
      const rightOrder = menuOrderById.get(right.masAccessId) ?? right.orderIndex;
      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }
      return left.displayName.localeCompare(right.displayName);
    }

    const leftParentOrder =
      menuOrderByKey.get(left.parentKey ?? "") ?? Number.MAX_SAFE_INTEGER;
    const rightParentOrder =
      menuOrderByKey.get(right.parentKey ?? "") ?? Number.MAX_SAFE_INTEGER;
    if (leftParentOrder !== rightParentOrder) {
      return leftParentOrder - rightParentOrder;
    }
    if (left.orderIndex !== right.orderIndex) {
      return left.orderIndex - right.orderIndex;
    }
    return left.displayName.localeCompare(right.displayName);
  });
};

export class MasterAccessRoleService {
  static async create(
    requesterId: string,
    reqBody: CreateMasterAccessRoleRequest
  ) {
    const req = Validation.validate(MasterAccessRoleValidation.CREATE, reqBody);
    await ensureAdmin(requesterId);

    const resourceType = normalizeRequiredUpper(req.resourceType);
    const resourceKey = normalizeRequiredUpper(req.resourceKey);
    const parentKey = normalizeUpper(req.parentKey) ?? null;

    const existing = await prismaFlowly.masterAccessRole.findUnique({
      where: {
        resourceType_resourceKey: {
          resourceType,
          resourceKey,
        },
      },
    });

    if (existing) {
      throw new ResponseError(400, "Master access role already exists");
    }

    await ensureParentExists(parentKey);
    await ensureUniqueOrderIndex(prismaFlowly, resourceType, parentKey);

    const createId = await generatemasAccessId();
    const now = new Date();
    const lastOrder = await prismaFlowly.masterAccessRole.findFirst({
      where: {
        resourceType,
        parentKey,
        isDeleted: false,
      },
      orderBy: { orderIndex: "desc" },
      select: { orderIndex: true },
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
        updatedBy: requesterId,
      },
    });

    return toMasterAccessRoleResponse(created);
  }

  static async update(
    requesterId: string,
    reqBody: UpdateMasterAccessRoleRequest
  ) {
    const req = Validation.validate(MasterAccessRoleValidation.UPDATE, reqBody);
    await ensureAdmin(requesterId);

    const existing = await prismaFlowly.masterAccessRole.findUnique({
      where: { masAccessId: req.masAccessId },
    });

    if (!existing || existing.isDeleted) {
      throw new ResponseError(404, "Master access role not found");
    }

    const existingResourceType = normalizeRequiredUpper(existing.resourceType);
    const existingParentKey = normalizeUpper(existing.parentKey) ?? null;
    const finalResourceType = normalizeRequiredUpper(
      req.resourceType ?? existing.resourceType
    );
    const finalResourceKey = normalizeRequiredUpper(
      req.resourceKey ?? existing.resourceKey
    );
    const finalParentKey =
      req.parentKey === undefined
        ? existingParentKey
        : normalizeUpper(req.parentKey) ?? null;

    if (existingResourceType !== finalResourceType) {
      const relatedMapping = await findActivePortalMenuMapping(
        existingResourceType,
        req.masAccessId
      );
      if (relatedMapping) {
        throw new ResponseError(
          400,
          "Mapped portal/menu resources cannot change resourceType"
        );
      }
    }

    const conflict = await prismaFlowly.masterAccessRole.findFirst({
      where: {
        resourceType: finalResourceType,
        resourceKey: finalResourceKey,
        masAccessId: { not: req.masAccessId },
      },
      select: { masAccessId: true },
    });

    if (conflict) {
      throw new ResponseError(400, "Resource type/key already exists");
    }

    await ensureParentExists(finalParentKey);

    const groupChanged =
      existingResourceType !== finalResourceType ||
      existingParentKey !== finalParentKey;
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
          throw new ResponseError(
            400,
            `orderIndex cannot exceed ${maxAllowed}`
          );
        }
      }

      if (groupChanged) {
        await tx.masterAccessRole.updateMany({
          where: {
            isDeleted: false,
            resourceType: existingResourceType,
            parentKey: existingParentKey,
            orderIndex: { gt: existing.orderIndex },
            masAccessId: { not: req.masAccessId },
          },
          data: {
            orderIndex: { decrement: 10 },
            updatedAt: now,
            updatedBy: requesterId,
          },
        });

        if (req.orderIndex === undefined) {
          const lastOrder = await tx.masterAccessRole.findFirst({
            where: {
              resourceType: finalResourceType,
              parentKey: finalParentKey,
              isDeleted: false,
            },
            orderBy: { orderIndex: "desc" },
            select: { orderIndex: true },
          });
          targetOrderIndex = (lastOrder?.orderIndex ?? 0) + 10;
        } else {
          await tx.masterAccessRole.updateMany({
            where: {
              isDeleted: false,
              resourceType: finalResourceType,
              parentKey: finalParentKey,
              orderIndex: { gte: targetOrderIndex },
              masAccessId: { not: req.masAccessId },
            },
            data: {
              orderIndex: { increment: 10 },
              updatedAt: now,
              updatedBy: requesterId,
            },
          });
        }
      } else if (
        req.orderIndex !== undefined &&
        req.orderIndex !== existing.orderIndex
      ) {
        if (targetOrderIndex < existing.orderIndex) {
          await tx.masterAccessRole.updateMany({
            where: {
              isDeleted: false,
              resourceType: existingResourceType,
              parentKey: existingParentKey,
              orderIndex: { gte: targetOrderIndex, lt: existing.orderIndex },
              masAccessId: { not: req.masAccessId },
            },
            data: {
              orderIndex: { increment: 10 },
              updatedAt: now,
              updatedBy: requesterId,
            },
          });
        } else {
          await tx.masterAccessRole.updateMany({
            where: {
              isDeleted: false,
              resourceType: existingResourceType,
              parentKey: existingParentKey,
              orderIndex: { gt: existing.orderIndex, lte: targetOrderIndex },
              masAccessId: { not: req.masAccessId },
            },
            data: {
              orderIndex: { decrement: 10 },
              updatedAt: now,
              updatedBy: requesterId,
            },
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
          parentKey:
            req.parentKey === undefined ? existingParentKey : finalParentKey,
          orderIndex: targetOrderIndex,
          isActive: req.isActive ?? existing.isActive,
          updatedAt: now,
          updatedBy: requesterId,
        },
      });
    });

    return toMasterAccessRoleResponse(updated);
  }

  static async softDelete(
    requesterId: string,
    reqBody: DeleteMasterAccessRoleRequest
  ) {
    const req = Validation.validate(MasterAccessRoleValidation.DELETE, reqBody);
    await ensureAdmin(requesterId);

    const existing = await prismaFlowly.masterAccessRole.findUnique({
      where: { masAccessId: req.masAccessId },
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
          updatedBy: requesterId,
        },
      });

      if (normalizedResourceType === "PORTAL") {
        await tx.portalMenuMap.updateMany({
          where: {
            portalMasAccessId: req.masAccessId,
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
      } else if (normalizedResourceType === "MENU") {
        await tx.portalMenuMap.updateMany({
          where: {
            menuMasAccessId: req.masAccessId,
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
      }

      await tx.masterAccessRole.updateMany({
        where: {
          isDeleted: false,
          resourceType: normalizedResourceType,
          parentKey: normalizedParentKey,
          orderIndex: { gt: existing.orderIndex },
        },
        data: {
          orderIndex: { decrement: 10 },
          updatedAt: now,
          updatedBy: requesterId,
        },
      });
    });

    return { message: "Master access role deleted" };
  }

  static async list(resourceType?: string, parentKey?: string, portalKey?: string) {
    const normalizedType = resourceType?.trim();
    const filterType = normalizedType ? normalizedType.toUpperCase() : undefined;
    const normalizedParentKey = parentKey?.trim();
    const filterParentKey =
      normalizedParentKey === undefined
        ? undefined
        : normalizedParentKey.toUpperCase() === "NULL"
          ? null
          : normalizedParentKey.toUpperCase();
    const filterPortalKey = normalizeUpper(portalKey) ?? undefined;

    if (filterPortalKey && filterType === "PORTAL") {
      const portalList = await prismaFlowly.masterAccessRole.findMany({
        where: {
          isDeleted: false,
          resourceType: "PORTAL",
          resourceKey: filterPortalKey,
        },
        orderBy: [
          { orderIndex: "asc" },
          { displayName: "asc" },
        ],
      });

      return portalList.map(toMasterAccessRoleListResponse);
    }

    if (!filterPortalKey) {
      const list = await prismaFlowly.masterAccessRole.findMany({
        where: {
          isDeleted: false,
          ...(filterType ? { resourceType: filterType } : {}),
          ...(filterParentKey === undefined ? {} : { parentKey: filterParentKey }),
        },
        orderBy: [
          { resourceType: "asc" },
          { orderIndex: "asc" },
          { displayName: "asc" },
        ],
      });

      return list.map(toMasterAccessRoleListResponse);
    }

    if (
      filterType !== undefined &&
      filterType !== "MENU" &&
      filterType !== "MODULE"
    ) {
      return [];
    }

    const portalScope = await resolvePortalScope(filterPortalKey);
    if (!portalScope || portalScope.menuIds.length === 0) {
      return [];
    }

    if (
      filterType === "MODULE" &&
      filterParentKey !== undefined &&
      filterParentKey !== null &&
      !portalScope.menuKeys.includes(filterParentKey)
    ) {
      return [];
    }

    const where: Prisma.MasterAccessRoleWhereInput = {
      isDeleted: false,
      ...(filterType ? { resourceType: filterType } : {}),
    };

    if (filterType === "MENU") {
      where.masAccessId = { in: portalScope.menuIds };
      if (filterParentKey !== undefined) {
        where.parentKey = filterParentKey;
      }
    } else if (filterType === "MODULE") {
      where.parentKey =
        filterParentKey === undefined
          ? { in: portalScope.menuKeys }
          : filterParentKey;
    } else {
      where.OR = [
        {
          resourceType: "MENU",
          masAccessId: { in: portalScope.menuIds },
        },
        {
          resourceType: "MODULE",
          parentKey: { in: portalScope.menuKeys },
        },
      ];
    }

    const list = await prismaFlowly.masterAccessRole.findMany({
      where,
      orderBy: [
        { resourceType: "asc" },
        { orderIndex: "asc" },
        { displayName: "asc" },
      ],
    });

    const sorted = sortPortalScopedRoles(
      list,
      filterType,
      portalScope.menuOrderById,
      portalScope.menuOrderByKey
    );

    return sorted.map(toMasterAccessRoleListResponse);
  }
}
