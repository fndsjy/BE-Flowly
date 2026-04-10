import { prismaFlowly } from "../application/database.js";
import { logger } from "../application/logging.js";
import {
  invalidateMasterAccessRoleCaches,
  type MasterAccessRoleListCacheFilters,
  type MasterAccessRolePortalScope,
  withMasterAccessRoleListCache,
  withMasterAccessRolePortalScopeCache,
} from "../application/master-access-role-cache.js";
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

type MasterAccessRolePerfTrace = {
  portalLookupMs?: number;
  portalMapMs?: number;
  listQueryMs?: number;
  resolutionMode?:
    | "portal-only"
    | "no-portal"
    | "portal-scoped"
    | "portal-scoped-empty"
    | "portal-invalid-type";
};

type MasterAccessRolePerfFilters = {
  resourceType: string | undefined;
  parentKey: string | undefined;
  portalKey: string | undefined;
};

type ResolvePortalScopeResult = {
  portalScope: MasterAccessRolePortalScope | null;
  trace: Pick<MasterAccessRolePerfTrace, "portalLookupMs" | "portalMapMs">;
};

const isEnabled = (value: string | undefined, defaultValue = false) => {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) {
    return defaultValue;
  }

  return normalized === "1" || normalized === "true" || normalized === "yes";
};

const parsePositiveInteger = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.floor(parsed);
};

const masterAccessRolePerfVerbose = isEnabled(
  process.env.MASTER_ACCESS_ROLE_PERF_LOG,
  false
);
const masterAccessRoleSlowThresholdMs = parsePositiveInteger(
  process.env.MASTER_ACCESS_ROLE_SLOW_THRESHOLD_MS,
  2000
);

const perfNow = () => process.hrtime.bigint();

const perfElapsedMs = (startedAt: bigint) =>
  Math.round((Number(process.hrtime.bigint() - startedAt) / 1_000_000) * 100) /
  100;

const shouldLogPerf = (totalMs: number) =>
  masterAccessRolePerfVerbose || totalMs >= masterAccessRoleSlowThresholdMs;

const logListPerf = (
  totalMs: number,
  trace: MasterAccessRolePerfTrace,
  filters: MasterAccessRolePerfFilters
) => {
  if (!shouldLogPerf(totalMs)) {
    return;
  }

  const level =
    totalMs >= masterAccessRoleSlowThresholdMs
      ? logger.warn.bind(logger)
      : logger.info.bind(logger);

  level("[MASTER ACCESS ROLE PERF]", {
    totalMs,
    thresholdMs: masterAccessRoleSlowThresholdMs,
    resourceType: filters.resourceType ?? null,
    parentKey: filters.parentKey ?? null,
    portalKey: filters.portalKey ?? null,
    resolutionMode: trace.resolutionMode ?? null,
    portalLookupMs: trace.portalLookupMs ?? null,
    portalMapMs: trace.portalMapMs ?? null,
    listQueryMs: trace.listQueryMs ?? null,
  });
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

const resolvePortalScope = async (
  portalKey?: string
): Promise<ResolvePortalScopeResult> => {
  const normalizedPortalKey = normalizeUpper(portalKey) ?? null;
  if (!normalizedPortalKey) {
    return {
      portalScope: null,
      trace: {},
    };
  }

  const trace: ResolvePortalScopeResult["trace"] = {};
  const portalScope = await withMasterAccessRolePortalScopeCache(
    normalizedPortalKey,
    async () => {
      const portalLookupStartedAt = perfNow();
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
      trace.portalLookupMs = perfElapsedMs(portalLookupStartedAt);

      if (!portal || portal.isDeleted || !portal.isActive) {
        return null;
      }

      const portalMapStartedAt = perfNow();
      const mappings = await prismaFlowly.portalMenuMap.findMany({
        where: {
          portalMasAccessId: portal.masAccessId,
          isDeleted: false,
          isActive: true,
        },
        orderBy: [{ orderIndex: "asc" }, { portalMenuMapId: "asc" }],
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
      trace.portalMapMs = perfElapsedMs(portalMapStartedAt);

      const filteredMappings = mappings.filter(
        (mapping) => mapping.menu && !mapping.menu.isDeleted
      );
      const menuIds = filteredMappings.map((mapping) => mapping.menuMasAccessId);
      const menuKeys = filteredMappings
        .map((mapping) => mapping.menu?.resourceKey ?? null)
        .filter((value): value is string => Boolean(value));
      const menuOrderById = new Map(
        filteredMappings.map((mapping) => [
          mapping.menuMasAccessId,
          mapping.orderIndex,
        ])
      );
      const menuOrderByKey = new Map(
        filteredMappings
          .filter((mapping) => mapping.menu?.resourceKey)
          .map((mapping) => [
            mapping.menu?.resourceKey as string,
            mapping.orderIndex,
          ])
      );

      return {
        portalMasAccessId: portal.masAccessId,
        menuIds,
        menuKeys,
        menuOrderById,
        menuOrderByKey,
      };
    }
  );

  return {
    portalScope,
    trace,
  };
};

const sortPortalScopedRoles = (
  items: Array<{
    masAccessId: string;
    resourceType: string;
    parentKey: string | null;
    displayName: string;
    resourceKey: string;
  }>,
  filterType: string | undefined,
  menuOrderById: Map<string, number>,
  menuOrderByKey: Map<string, number>
) => {
  return [...items].sort((left, right) => {
    if (filterType === "MENU") {
      const leftOrder = menuOrderById.get(left.masAccessId) ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = menuOrderById.get(right.masAccessId) ?? Number.MAX_SAFE_INTEGER;
      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }
      const displayCompare = left.displayName.localeCompare(right.displayName);
      if (displayCompare !== 0) {
        return displayCompare;
      }
      return left.resourceKey.localeCompare(right.resourceKey);
    }

    if (filterType === "MODULE") {
      const leftParentOrder =
        menuOrderByKey.get(left.parentKey ?? "") ?? Number.MAX_SAFE_INTEGER;
      const rightParentOrder =
        menuOrderByKey.get(right.parentKey ?? "") ?? Number.MAX_SAFE_INTEGER;
      if (leftParentOrder !== rightParentOrder) {
        return leftParentOrder - rightParentOrder;
      }
      const parentCompare = (left.parentKey ?? "").localeCompare(right.parentKey ?? "");
      if (parentCompare !== 0) {
        return parentCompare;
      }
      const displayCompare = left.displayName.localeCompare(right.displayName);
      if (displayCompare !== 0) {
        return displayCompare;
      }
      return left.resourceKey.localeCompare(right.resourceKey);
    }

    if (left.resourceType !== right.resourceType) {
      return left.resourceType.localeCompare(right.resourceType);
    }

    if (left.resourceType === "MENU") {
      const leftOrder = menuOrderById.get(left.masAccessId) ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = menuOrderById.get(right.masAccessId) ?? Number.MAX_SAFE_INTEGER;
      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }
      const displayCompare = left.displayName.localeCompare(right.displayName);
      if (displayCompare !== 0) {
        return displayCompare;
      }
      return left.resourceKey.localeCompare(right.resourceKey);
    }

    const leftParentOrder =
      menuOrderByKey.get(left.parentKey ?? "") ?? Number.MAX_SAFE_INTEGER;
    const rightParentOrder =
      menuOrderByKey.get(right.parentKey ?? "") ?? Number.MAX_SAFE_INTEGER;
    if (leftParentOrder !== rightParentOrder) {
      return leftParentOrder - rightParentOrder;
    }
    const parentCompare = (left.parentKey ?? "").localeCompare(right.parentKey ?? "");
    if (parentCompare !== 0) {
      return parentCompare;
    }
    const displayCompare = left.displayName.localeCompare(right.displayName);
    if (displayCompare !== 0) {
      return displayCompare;
    }
    return left.resourceKey.localeCompare(right.resourceKey);
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

    const createId = await generatemasAccessId();
    const now = new Date();
    const created = await prismaFlowly.masterAccessRole.create({
      data: {
        masAccessId: createId(),
        resourceType,
        resourceKey,
        displayName: req.displayName,
        route: req.route ?? null,
        parentKey,
        isActive: req.isActive ?? true,
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
        createdBy: requesterId,
        updatedBy: requesterId,
      },
    });

    invalidateMasterAccessRoleCaches();

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
    const now = new Date();
    const updated = await prismaFlowly.masterAccessRole.update({
      where: { masAccessId: req.masAccessId },
      data: {
        resourceType: finalResourceType,
        resourceKey: finalResourceKey,
        displayName: req.displayName ?? existing.displayName,
        route: req.route === undefined ? existing.route : req.route,
        parentKey:
          req.parentKey === undefined ? existingParentKey : finalParentKey,
        isActive: req.isActive ?? existing.isActive,
        updatedAt: now,
        updatedBy: requesterId,
      },
    });

    invalidateMasterAccessRoleCaches();

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
    });

    invalidateMasterAccessRoleCaches();

    return { message: "Master access role deleted" };
  }

  static async list(resourceType?: string, parentKey?: string, portalKey?: string) {
    const startedAt = perfNow();
    const trace: MasterAccessRolePerfTrace = {};
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
    const cacheFilters: MasterAccessRoleListCacheFilters = {
      resourceType: filterType,
      parentKey: filterParentKey,
      portalKey: filterPortalKey,
    };

    return withMasterAccessRoleListCache(cacheFilters, async () => {
      if (filterPortalKey && filterType === "PORTAL") {
        trace.resolutionMode = "portal-only";
        const listQueryStartedAt = perfNow();
        const portalList = await prismaFlowly.masterAccessRole.findMany({
          where: {
            isDeleted: false,
            resourceType: "PORTAL",
            resourceKey: filterPortalKey,
          },
          orderBy: [{ displayName: "asc" }, { resourceKey: "asc" }],
        });
        trace.listQueryMs = perfElapsedMs(listQueryStartedAt);
        logListPerf(perfElapsedMs(startedAt), trace, {
          resourceType,
          parentKey,
          portalKey,
        });

        return portalList.map(toMasterAccessRoleListResponse);
      }

      if (!filterPortalKey) {
        trace.resolutionMode = "no-portal";
        const listQueryStartedAt = perfNow();
        const list = await prismaFlowly.masterAccessRole.findMany({
          where: {
            isDeleted: false,
            ...(filterType ? { resourceType: filterType } : {}),
            ...(filterParentKey === undefined
              ? {}
              : { parentKey: filterParentKey }),
          },
          orderBy: [
            { resourceType: "asc" },
            { parentKey: "asc" },
            { displayName: "asc" },
            { resourceKey: "asc" },
          ],
        });
        trace.listQueryMs = perfElapsedMs(listQueryStartedAt);
        logListPerf(perfElapsedMs(startedAt), trace, {
          resourceType,
          parentKey,
          portalKey,
        });

        return list.map(toMasterAccessRoleListResponse);
      }

      if (
        filterType !== undefined &&
        filterType !== "MENU" &&
        filterType !== "MODULE"
      ) {
        trace.resolutionMode = "portal-invalid-type";
        logListPerf(perfElapsedMs(startedAt), trace, {
          resourceType,
          parentKey,
          portalKey,
        });
        return [];
      }

      const {
        portalScope,
        trace: portalTrace,
      } = await resolvePortalScope(filterPortalKey);
      if (portalTrace.portalLookupMs !== undefined) {
        trace.portalLookupMs = portalTrace.portalLookupMs;
      }
      if (portalTrace.portalMapMs !== undefined) {
        trace.portalMapMs = portalTrace.portalMapMs;
      }
      if (!portalScope || portalScope.menuIds.length === 0) {
        trace.resolutionMode = "portal-scoped-empty";
        logListPerf(perfElapsedMs(startedAt), trace, {
          resourceType,
          parentKey,
          portalKey,
        });
        return [];
      }

      trace.resolutionMode = "portal-scoped";

      if (
        filterType === "MODULE" &&
        filterParentKey !== undefined &&
        filterParentKey !== null &&
        !portalScope.menuKeys.includes(filterParentKey)
      ) {
        logListPerf(perfElapsedMs(startedAt), trace, {
          resourceType,
          parentKey,
          portalKey,
        });
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

      const listQueryStartedAt = perfNow();
      const list = await prismaFlowly.masterAccessRole.findMany({
        where,
        orderBy: [
          { resourceType: "asc" },
          { displayName: "asc" },
          { resourceKey: "asc" },
        ],
      });
      trace.listQueryMs = perfElapsedMs(listQueryStartedAt);

      const sorted = sortPortalScopedRoles(
        list,
        filterType,
        portalScope.menuOrderById,
        portalScope.menuOrderByKey
      );

      logListPerf(perfElapsedMs(startedAt), trace, {
        resourceType,
        parentKey,
        portalKey,
      });

      return sorted.map(toMasterAccessRoleListResponse);
    });
  }
}
