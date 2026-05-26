import { prismaFlowly } from "../application/database.js";
import { ResponseError } from "../error/response-error.js";

type AccessResource = {
  resourceType: string;
  resourceKey: string;
};

const normalizeUpper = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed.toUpperCase() : "";
};

const normalizeAccessLevel = (value: string) => {
  const upper = normalizeUpper(value);
  return upper === "FULL" ? "CRUD" : upper;
};

const allowedAccessLevels = new Set(["READ", "CRUD"]);

const buildAccessKey = (resourceType: string, resourceKey: string) =>
  `${normalizeUpper(resourceType)}:${normalizeUpper(resourceKey)}`;

const resolveAccessResource = (
  access: {
    resourceType: string;
    resourceKey: string | null;
    masAccessId: string | null;
  },
  masterAccessMap: Map<string, { resourceType: string; resourceKey: string }>
) => {
  const master = !access.resourceKey && access.masAccessId
    ? masterAccessMap.get(access.masAccessId)
    : undefined;
  const resourceType = normalizeUpper(master?.resourceType ?? access.resourceType);
  const resourceKey = normalizeUpper(access.resourceKey ?? master?.resourceKey);

  if (!resourceType || !resourceKey) {
    return null;
  }

  return { resourceType, resourceKey };
};

export const hasConfiguredAccess = async (
  requesterId: string,
  resources: AccessResource[]
) => {
  const requester = await prismaFlowly.user.findUnique({
    where: { userId: requesterId },
    select: {
      userId: true,
      roleId: true,
      isActive: true,
      isDeleted: true,
      role: { select: { roleLevel: true } },
    },
  });

  if (requester && (requester.isDeleted || !requester.isActive)) {
    return false;
  }

  if (requester?.role?.roleLevel === 1) {
    return true;
  }

  const targetResources = resources
    .map((resource) => ({
      resourceType: normalizeUpper(resource.resourceType),
      resourceKey: normalizeUpper(resource.resourceKey),
    }))
    .filter((resource) => resource.resourceType && resource.resourceKey);

  if (targetResources.length === 0) {
    return false;
  }

  const targetKeys = new Set(
    targetResources.map((resource) =>
      buildAccessKey(resource.resourceType, resource.resourceKey)
    )
  );
  const targetResourceTypes = Array.from(
    new Set(targetResources.map((resource) => resource.resourceType))
  );

  const subjectFilters = [{ subjectType: "USER", subjectId: requesterId }];
  if (requester?.roleId) {
    subjectFilters.unshift({ subjectType: "ROLE", subjectId: requester.roleId });
  }

  const accessRoles = await prismaFlowly.accessRole.findMany({
    where: {
      isDeleted: false,
      resourceType: { in: targetResourceTypes },
      OR: subjectFilters,
    },
    select: {
      subjectType: true,
      resourceType: true,
      resourceKey: true,
      masAccessId: true,
      accessLevel: true,
      isActive: true,
    },
  });

  const missingResourceKeyIds = accessRoles
    .filter((access) => !access.resourceKey && access.masAccessId)
    .map((access) => access.masAccessId as string);

  const masterAccessRoles = missingResourceKeyIds.length > 0
    ? await prismaFlowly.masterAccessRole.findMany({
        where: { masAccessId: { in: missingResourceKeyIds } },
        select: {
          masAccessId: true,
          resourceType: true,
          resourceKey: true,
        },
      })
    : [];

  const masterAccessMap = new Map(
    masterAccessRoles.map((access) => [access.masAccessId, access])
  );
  const accessMap = new Map<string, string>();

  const applyAccess = (
    resourceType: string,
    resourceKey: string,
    accessLevel: string,
    override: boolean
  ) => {
    const key = buildAccessKey(resourceType, resourceKey);
    if (!targetKeys.has(key)) {
      return;
    }

    const normalizedLevel = normalizeAccessLevel(accessLevel);
    if (!allowedAccessLevels.has(normalizedLevel)) {
      return;
    }

    const existing = accessMap.get(key);
    if (!existing || override || (existing === "READ" && normalizedLevel === "CRUD")) {
      accessMap.set(key, normalizedLevel);
    }
  };

  const roleAccess = accessRoles.filter(
    (access) => normalizeUpper(access.subjectType) === "ROLE"
  );
  const userAccess = accessRoles.filter(
    (access) => normalizeUpper(access.subjectType) === "USER"
  );

  for (const access of roleAccess) {
    if (!access.isActive) {
      continue;
    }

    const resolved = resolveAccessResource(access, masterAccessMap);
    if (!resolved) {
      continue;
    }

    applyAccess(resolved.resourceType, resolved.resourceKey, access.accessLevel, false);
  }

  for (const access of userAccess) {
    const resolved = resolveAccessResource(access, masterAccessMap);
    if (!resolved) {
      continue;
    }

    const key = buildAccessKey(resolved.resourceType, resolved.resourceKey);
    if (!targetKeys.has(key)) {
      continue;
    }

    if (!access.isActive) {
      accessMap.delete(key);
      continue;
    }

    applyAccess(resolved.resourceType, resolved.resourceKey, access.accessLevel, true);
  }

  return Array.from(targetKeys).some((key) => accessMap.has(key));
};

export const hasEmployeeAdminAccess = (requesterId: string) =>
  hasConfiguredAccess(requesterId, [{ resourceType: "MENU", resourceKey: "ADMIN" }]);

export const ensureEmployeeAdminAccess = async (
  requesterId: string,
  message = "Access denied"
) => {
  if (!(await hasEmployeeAdminAccess(requesterId))) {
    throw new ResponseError(403, message);
  }
};
