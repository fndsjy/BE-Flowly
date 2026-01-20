import { prismaFlowly, prismaEmployee } from "../application/database.js";
import { ResponseError } from "../error/response-error.js";

export type AccessScope = {
  read: Set<number>;
  crud: Set<number>;
};

export type AccessContext = {
  isAdmin: boolean;
  pilar: AccessScope;
  sbu: AccessScope;
  sbuSub: AccessScope;
};

type AccessLevel = "READ" | "CRUD";

export type ModuleAccessMap = Map<string, AccessLevel>;

const normalizeUpper = (value: string) => value.trim().toUpperCase();

const allowedLevels = new Set<AccessLevel>(["READ", "CRUD"]);

const normalizeAccessLevel = (value: string): AccessLevel => {
  const upper = normalizeUpper(value);
  if (upper === "FULL") {
    return "CRUD";
  }
  return upper as AccessLevel;
};

const buildScope = (read: Set<number>, crud: Set<number>): AccessScope => ({
  read,
  crud
});

const addAllow = (targetRead: Set<number>, targetCrud: Set<number>, id: number, level: AccessLevel) => {
  targetRead.add(id);
  if (level === "CRUD") {
    targetCrud.add(id);
  }
};

export const getAccessContext = async (userId: string): Promise<AccessContext> => {
  const flowlyUser = await prismaFlowly.user.findUnique({
    where: { userId },
    include: { role: true }
  });

  if (flowlyUser?.role?.roleLevel === 1) {
    return {
      isAdmin: true,
      pilar: buildScope(new Set(), new Set()),
      sbu: buildScope(new Set(), new Set()),
      sbuSub: buildScope(new Set(), new Set())
    };
  }

  const sbuSubRead = new Set<number>();
  const sbuSubCrud = new Set<number>();
  const sbuRead = new Set<number>();
  const sbuCrud = new Set<number>();
  const pilarRead = new Set<number>();
  const pilarCrud = new Set<number>();
  const pilarPicIds = new Set<number>();
  const sbuPicIds = new Set<number>();

  const userIdNumber = Number(userId);
  const isEmployeeUser = !Number.isNaN(userIdNumber);
  if (isEmployeeUser) {
    const chartMembers = await prismaFlowly.chartMember.findMany({
      where: {
        userId: userIdNumber,
        isDeleted: false
      },
      select: {
        node: {
          select: {
            pilarId: true,
            sbuId: true,
            sbuSubId: true
          }
        }
      }
    });

    for (const member of chartMembers) {
      sbuSubRead.add(member.node.sbuSubId);
      if (member.node.sbuId !== null && member.node.sbuId !== undefined) {
        sbuRead.add(member.node.sbuId);
      }
      if (member.node.pilarId !== null && member.node.pilarId !== undefined) {
        pilarRead.add(member.node.pilarId);
      }
    }

    const [pilarPics, sbuPics, sbuSubPics] = await Promise.all([
      prismaEmployee.em_pilar.findMany({
        where: {
          pic: userIdNumber,
          status: "A",
          OR: [{ isDeleted: false }, { isDeleted: null }]
        },
        select: { id: true }
      }),
      prismaEmployee.em_sbu.findMany({
        where: {
          pic: userIdNumber,
          status: "A",
          OR: [{ isDeleted: false }, { isDeleted: null }]
        },
        select: { id: true, sbu_pilar: true }
      }),
      prismaEmployee.em_sbu_sub.findMany({
        where: {
          pic: userIdNumber,
          status: "A",
          OR: [{ isDeleted: false }, { isDeleted: null }]
        },
        select: { id: true, sbu_id: true, sbu_pilar: true }
      })
    ]);

    for (const pilar of pilarPics) {
      pilarRead.add(pilar.id);
      pilarPicIds.add(pilar.id);
    }

    for (const sbu of sbuPics) {
      sbuRead.add(sbu.id);
      sbuPicIds.add(sbu.id);
      if (sbu.sbu_pilar !== null && sbu.sbu_pilar !== undefined) {
        pilarRead.add(sbu.sbu_pilar);
      }
    }

    for (const sbuSub of sbuSubPics) {
      sbuSubRead.add(sbuSub.id);
      if (sbuSub.sbu_id !== null && sbuSub.sbu_id !== undefined) {
        sbuRead.add(sbuSub.sbu_id);
      }
      if (sbuSub.sbu_pilar !== null && sbuSub.sbu_pilar !== undefined) {
        pilarRead.add(sbuSub.sbu_pilar);
      }
    }

    if (pilarPicIds.size > 0) {
      const pilarIds = Array.from(pilarPicIds);
      const [sbus, sbuSubsByPilar] = await Promise.all([
        prismaEmployee.em_sbu.findMany({
          where: {
            sbu_pilar: { in: pilarIds },
            status: "A",
            OR: [{ isDeleted: false }, { isDeleted: null }]
          },
          select: { id: true }
        }),
        prismaEmployee.em_sbu_sub.findMany({
          where: {
            sbu_pilar: { in: pilarIds },
            status: "A",
            OR: [{ isDeleted: false }, { isDeleted: null }]
          },
          select: { id: true }
        })
      ]);

      const sbuIds = sbus.map((sbu) => sbu.id);
      const sbuSubsBySbu = sbuIds.length > 0
        ? await prismaEmployee.em_sbu_sub.findMany({
            where: {
              sbu_id: { in: sbuIds },
              status: "A",
              OR: [{ isDeleted: false }, { isDeleted: null }]
            },
            select: { id: true }
          })
        : [];

      for (const sbu of sbus) {
        sbuRead.add(sbu.id);
      }
      for (const sbuSub of sbuSubsByPilar) {
        sbuSubRead.add(sbuSub.id);
      }
      for (const sbuSub of sbuSubsBySbu) {
        sbuSubRead.add(sbuSub.id);
      }
    }

    if (sbuPicIds.size > 0) {
      const sbuIds = Array.from(sbuPicIds);
      const sbuSubs = await prismaEmployee.em_sbu_sub.findMany({
        where: {
          sbu_id: { in: sbuIds },
          status: "A",
          OR: [{ isDeleted: false }, { isDeleted: null }]
        },
        select: { id: true }
      });

      for (const sbuSub of sbuSubs) {
        sbuSubRead.add(sbuSub.id);
      }
    }

  }

  if (isEmployeeUser) {
    return {
      isAdmin: false,
      pilar: buildScope(pilarRead, pilarCrud),
      sbu: buildScope(sbuRead, sbuCrud),
      sbuSub: buildScope(sbuSubRead, sbuSubCrud)
    };
  }

  const accessRoleFilters = [
    { subjectType: "USER", subjectId: userId }
  ];
  if (flowlyUser?.roleId) {
    accessRoleFilters.unshift({ subjectType: "ROLE", subjectId: flowlyUser.roleId });
  }

  const accessRoles = await prismaFlowly.accessRole.findMany({
    where: {
      isDeleted: false,
      OR: accessRoleFilters
    }
  });

  const missingResourceKeyIds = accessRoles
    .filter((role) => !role.resourceKey && role.masAccessId)
    .map((role) => role.masAccessId as string);

  const masterAccessRoles = missingResourceKeyIds.length > 0
    ? await prismaFlowly.masterAccessRole.findMany({
        where: { masAccessId: { in: missingResourceKeyIds } },
        select: { masAccessId: true, resourceKey: true, resourceType: true }
      })
    : [];

  const masterAccessMap = new Map(
    masterAccessRoles.map((role) => [role.masAccessId, role])
  );

  const denyPilar = new Set<number>();
  const denySbu = new Set<number>();
  const denySbuSub = new Set<number>();

  const supportedResourceTypes = new Set(["PILAR", "SBU", "SBU_SUB"]);
  const directSbuRead = new Set<number>();
  const directSbuSubRead = new Set<number>();

  const accessMap = new Map<string, AccessLevel>();

  const applyAccess = (
    resourceType: string,
    resourceId: number,
    accessLevel: AccessLevel,
    override: boolean
  ) => {
    const key = `${resourceType}:${resourceId}`;
    const existing = accessMap.get(key);

    if (!existing || override) {
      accessMap.set(key, accessLevel);
      return;
    }

    if (existing === "READ" && accessLevel === "CRUD") {
      accessMap.set(key, accessLevel);
    }
  };

  const resolveResourceId = (access: {
    resourceType: string;
    resourceKey: string | null;
    masAccessId: string | null;
  }) => {
    const resourceType = normalizeUpper(access.resourceType);
    if (!supportedResourceTypes.has(resourceType)) {
      return null;
    }
    const master = !access.resourceKey && access.masAccessId
      ? masterAccessMap.get(access.masAccessId)
      : undefined;
    const resourceKey = access.resourceKey ?? master?.resourceKey ?? null;
    if (!resourceKey) {
      return null;
    }

    const resourceId = Number(resourceKey);
    if (Number.isNaN(resourceId)) {
      return null;
    }

    return { resourceType, resourceId };
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

    const resolved = resolveResourceId(access);
    if (!resolved) {
      continue;
    }

    const accessLevel = normalizeAccessLevel(access.accessLevel);
    if (!allowedLevels.has(accessLevel)) {
      throw new ResponseError(400, `Unsupported access level: ${access.accessLevel}`);
    }

    applyAccess(resolved.resourceType, resolved.resourceId, accessLevel, false);
  }

  for (const access of userAccess) {
    const resolved = resolveResourceId(access);
    if (!resolved) {
      continue;
    }

    const accessLevel = normalizeAccessLevel(access.accessLevel);
    if (!allowedLevels.has(accessLevel)) {
      throw new ResponseError(400, `Unsupported access level: ${access.accessLevel}`);
    }

    if (!access.isActive) {
      if (resolved.resourceType === "PILAR") denyPilar.add(resolved.resourceId);
      if (resolved.resourceType === "SBU") denySbu.add(resolved.resourceId);
      if (resolved.resourceType === "SBU_SUB") denySbuSub.add(resolved.resourceId);
      accessMap.delete(`${resolved.resourceType}:${resolved.resourceId}`);
      continue;
    }

    applyAccess(resolved.resourceType, resolved.resourceId, accessLevel, true);
  }

  for (const [key, accessLevel] of accessMap.entries()) {
    const [resourceType, resourceIdText] = key.split(":");
    const resourceId = Number(resourceIdText);
    if (Number.isNaN(resourceId)) {
      continue;
    }

    if (resourceType === "PILAR") {
      addAllow(pilarRead, pilarCrud, resourceId, accessLevel);
    }
    if (resourceType === "SBU") {
      addAllow(sbuRead, sbuCrud, resourceId, accessLevel);
      directSbuRead.add(resourceId);
    }
    if (resourceType === "SBU_SUB") {
      addAllow(sbuSubRead, sbuSubCrud, resourceId, accessLevel);
      directSbuSubRead.add(resourceId);
    }
  }

  if (directSbuRead.size > 0) {
    const sbuIds = Array.from(directSbuRead);
    const sbuParents = await prismaEmployee.em_sbu.findMany({
      where: {
        id: { in: sbuIds },
        status: "A",
        OR: [{ isDeleted: false }, { isDeleted: null }]
      },
      select: { id: true, sbu_pilar: true }
    });

    for (const sbu of sbuParents) {
      if (sbu.sbu_pilar !== null && sbu.sbu_pilar !== undefined) {
        pilarRead.add(sbu.sbu_pilar);
      }
    }
  }

  if (directSbuSubRead.size > 0) {
    const sbuSubIds = Array.from(directSbuSubRead);
    const sbuSubs = await prismaEmployee.em_sbu_sub.findMany({
      where: {
        id: { in: sbuSubIds },
        status: "A",
        OR: [{ isDeleted: false }, { isDeleted: null }]
      },
      select: { id: true, sbu_id: true, sbu_pilar: true }
    });

    for (const sbuSub of sbuSubs) {
      if (sbuSub.sbu_id !== null && sbuSub.sbu_id !== undefined) {
        sbuRead.add(sbuSub.sbu_id);
      }
      if (sbuSub.sbu_pilar !== null && sbuSub.sbu_pilar !== undefined) {
        pilarRead.add(sbuSub.sbu_pilar);
      }
    }
  }

  for (const deniedId of denySbuSub) {
    sbuSubRead.delete(deniedId);
    sbuSubCrud.delete(deniedId);
  }

  const allowedSbuSubIds = Array.from(sbuSubRead);
  if (allowedSbuSubIds.length > 0) {
    const charts = await prismaFlowly.chart.findMany({
      where: {
        isDeleted: false,
        sbuSubId: { in: allowedSbuSubIds }
      },
      select: {
        sbuId: true,
        pilarId: true
      }
    });

    for (const chart of charts) {
      sbuRead.add(chart.sbuId);
      pilarRead.add(chart.pilarId);
    }
  }

  for (const deniedId of denySbu) {
    sbuRead.delete(deniedId);
    sbuCrud.delete(deniedId);
  }

  for (const deniedId of denyPilar) {
    pilarRead.delete(deniedId);
    pilarCrud.delete(deniedId);
  }

  return {
    isAdmin: false,
    pilar: buildScope(pilarRead, pilarCrud),
    sbu: buildScope(sbuRead, sbuCrud),
    sbuSub: buildScope(sbuSubRead, sbuSubCrud)
  };
};

export const canRead = (scope: AccessScope, id: number) =>
  scope.read.has(id) || scope.crud.has(id);

export const canCrud = (scope: AccessScope, id: number) =>
  scope.crud.has(id);

const normalizeSubjectType = (value: string) => normalizeUpper(value);

export const getModuleAccessMap = async (userId: string): Promise<ModuleAccessMap> => {
  const flowlyUser = await prismaFlowly.user.findUnique({
    where: { userId },
    include: { role: true }
  });

  let isAdmin = false;
  let roleId: string | null = null;
  let isEmployeeUser = false;
  let shouldCheckEmployee = false;

  if (flowlyUser) {
    isAdmin = flowlyUser.role?.roleLevel === 1;
    roleId = flowlyUser.roleId;
    shouldCheckEmployee = !isAdmin;
  } else {
    const employeeId = Number(userId);
    if (Number.isNaN(employeeId)) {
      throw new ResponseError(401, "Unauthorized");
    }

    const employee = await prismaEmployee.em_employee.findUnique({
      where: { UserId: employeeId },
      select: { UserId: true }
    });

    if (!employee) {
      throw new ResponseError(401, "Unauthorized");
    }
    isEmployeeUser = true;
  }

  if (shouldCheckEmployee) {
    const employeeId = Number(userId);
    if (!Number.isNaN(employeeId)) {
      const employee = await prismaEmployee.em_employee.findUnique({
        where: { UserId: employeeId },
        select: { UserId: true }
      });
      if (employee) {
        isEmployeeUser = true;
      }
    }
  }

  if (isAdmin) {
    return new Map();
  }

  if (isEmployeeUser) {
    const accessContext = await getAccessContext(userId);
    const hasPilarRead = accessContext.pilar.read.size > 0 || accessContext.pilar.crud.size > 0;
    const hasSbuRead = accessContext.sbu.read.size > 0 || accessContext.sbu.crud.size > 0;
    const hasSbuSubRead = accessContext.sbuSub.read.size > 0 || accessContext.sbuSub.crud.size > 0;
    const canReadChart = hasPilarRead || hasSbuRead || hasSbuSubRead;

    const accessMap: ModuleAccessMap = new Map();
    const applyEmployeeRead = (resourceKey: string) => {
      const normalizedKey = normalizeUpper(resourceKey);
      if (!normalizedKey) {
        return;
      }
      accessMap.set(normalizedKey, "READ");
    };

    if (hasPilarRead) {
      applyEmployeeRead("PILAR");
    }
    if (hasSbuRead) {
      applyEmployeeRead("SBU");
    }
    if (hasSbuSubRead) {
      applyEmployeeRead("SBU_SUB");
    }
    if (canReadChart) {
      applyEmployeeRead("CHART");
      applyEmployeeRead("CHART_MEMBER");
    }

    return accessMap;
  }

  const subjectFilters = [{ subjectType: "USER", subjectId: userId }];
  if (roleId) {
    subjectFilters.unshift({ subjectType: "ROLE", subjectId: roleId });
  }

  const accessRoles = await prismaFlowly.accessRole.findMany({
    where: {
      isDeleted: false,
      resourceType: "MODULE",
      OR: subjectFilters
    },
    select: {
      subjectType: true,
      resourceKey: true,
      masAccessId: true,
      accessLevel: true,
      isActive: true
    }
  });

  const missingResourceKeyIds = accessRoles
    .filter((role) => !role.resourceKey && role.masAccessId)
    .map((role) => role.masAccessId as string);

  const masterAccessRoles = missingResourceKeyIds.length > 0
    ? await prismaFlowly.masterAccessRole.findMany({
        where: { masAccessId: { in: missingResourceKeyIds } },
        select: { masAccessId: true, resourceKey: true, resourceType: true }
      })
    : [];

  const masterAccessMap = new Map(
    masterAccessRoles.map((role) => [role.masAccessId, role])
  );

  const accessMap: ModuleAccessMap = new Map();
  const deniedKeys = new Set<string>();

  const applyAccess = (resourceKey: string, accessLevel: string, override: boolean) => {
    const normalizedLevel = normalizeAccessLevel(accessLevel);
    if (!allowedLevels.has(normalizedLevel)) {
      return;
    }

    const normalizedKey = normalizeUpper(resourceKey);
    if (!normalizedKey) {
      return;
    }

    const existing = accessMap.get(normalizedKey);
    if (!existing || override) {
      accessMap.set(normalizedKey, normalizedLevel);
      return;
    }

    if (existing === "READ" && normalizedLevel === "CRUD") {
      accessMap.set(normalizedKey, normalizedLevel);
    }
  };

  const resolveResourceKey = (access: typeof accessRoles[number]) => {
    const master = !access.resourceKey && access.masAccessId
      ? masterAccessMap.get(access.masAccessId)
      : undefined;
    const resourceKey = access.resourceKey ?? master?.resourceKey ?? null;
    if (!resourceKey) {
      return null;
    }
    return normalizeUpper(resourceKey);
  };

  const roleAccess = accessRoles.filter(
    (access) => normalizeSubjectType(access.subjectType) === "ROLE"
  );
  const userAccess = accessRoles.filter(
    (access) => normalizeSubjectType(access.subjectType) === "USER"
  );

  for (const access of roleAccess) {
    if (!access.isActive) {
      continue;
    }

    const resourceKey = resolveResourceKey(access);
    if (!resourceKey) {
      continue;
    }

    applyAccess(resourceKey, access.accessLevel, false);
  }

  for (const access of userAccess) {
    const resourceKey = resolveResourceKey(access);
    if (!resourceKey) {
      continue;
    }

    if (!access.isActive) {
      accessMap.delete(resourceKey);
      deniedKeys.add(resourceKey);
      continue;
    }

    applyAccess(resourceKey, access.accessLevel, true);
  }

  return accessMap;
};

export const canReadModule = (moduleAccessMap: ModuleAccessMap, resourceKey: string) => {
  const normalizedKey = normalizeUpper(resourceKey);
  if (!normalizedKey) {
    return false;
  }
  const level = moduleAccessMap.get(normalizedKey);
  return level === "READ" || level === "CRUD";
};

export const canCrudModule = (moduleAccessMap: ModuleAccessMap, resourceKey: string) => {
  const normalizedKey = normalizeUpper(resourceKey);
  if (!normalizedKey) {
    return false;
  }
  const level = moduleAccessMap.get(normalizedKey);
  return level === "CRUD";
};
