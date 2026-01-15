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

  const userIdNumber = Number(userId);
  if (!Number.isNaN(userIdNumber)) {
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

    const pilarPicIds = new Set<number>();
    for (const pilar of pilarPics) {
      pilarRead.add(pilar.id);
      pilarPicIds.add(pilar.id);
    }

    const sbuPicIds = new Set<number>();
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
      const [sbusUnderPilar, sbuSubsUnderPilar] = await Promise.all([
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
          select: { id: true, sbu_id: true }
        })
      ]);

      const sbuIdsUnderPilar = sbusUnderPilar.map((sbu) => sbu.id);

      for (const sbu of sbusUnderPilar) {
        sbuRead.add(sbu.id);
      }

      for (const sbuSub of sbuSubsUnderPilar) {
        sbuSubRead.add(sbuSub.id);
        if (sbuSub.sbu_id !== null && sbuSub.sbu_id !== undefined) {
          sbuRead.add(sbuSub.sbu_id);
        }
      }

      if (sbuIdsUnderPilar.length > 0) {
        const sbuSubsUnderSbuFromPilar = await prismaEmployee.em_sbu_sub.findMany({
          where: {
            sbu_id: { in: sbuIdsUnderPilar },
            status: "A",
            OR: [{ isDeleted: false }, { isDeleted: null }]
          },
          select: { id: true, sbu_pilar: true }
        });

        for (const sbuSub of sbuSubsUnderSbuFromPilar) {
          sbuSubRead.add(sbuSub.id);
          if (sbuSub.sbu_pilar !== null && sbuSub.sbu_pilar !== undefined) {
            pilarRead.add(sbuSub.sbu_pilar);
          }
        }
      }
    }

    if (sbuPicIds.size > 0) {
      const sbuIds = Array.from(sbuPicIds);
      const sbuSubsUnderSbu = await prismaEmployee.em_sbu_sub.findMany({
        where: {
          sbu_id: { in: sbuIds },
          status: "A",
          OR: [{ isDeleted: false }, { isDeleted: null }]
        },
        select: { id: true, sbu_pilar: true }
      });

      for (const sbuSub of sbuSubsUnderSbu) {
        sbuSubRead.add(sbuSub.id);
        if (sbuSub.sbu_pilar !== null && sbuSub.sbu_pilar !== undefined) {
          pilarRead.add(sbuSub.sbu_pilar);
        }
      }
    }
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
  const directPilarRead = new Set<number>();
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
      directPilarRead.add(resourceId);
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

  if (directPilarRead.size > 0) {
    const pilarIds = Array.from(directPilarRead);
    const [sbusUnderPilar, sbuSubsUnderPilar] = await Promise.all([
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
        select: { id: true, sbu_id: true }
      })
    ]);

    const sbuIdsUnderPilar = sbusUnderPilar.map((sbu) => sbu.id);

    for (const sbu of sbusUnderPilar) {
      sbuRead.add(sbu.id);
    }

    for (const sbuSub of sbuSubsUnderPilar) {
      sbuSubRead.add(sbuSub.id);
      if (sbuSub.sbu_id !== null && sbuSub.sbu_id !== undefined) {
        sbuRead.add(sbuSub.sbu_id);
      }
    }

    if (sbuIdsUnderPilar.length > 0) {
      const sbuSubsUnderSbuFromPilar = await prismaEmployee.em_sbu_sub.findMany({
        where: {
          sbu_id: { in: sbuIdsUnderPilar },
          status: "A",
          OR: [{ isDeleted: false }, { isDeleted: null }]
        },
        select: { id: true, sbu_pilar: true }
      });

      for (const sbuSub of sbuSubsUnderSbuFromPilar) {
        sbuSubRead.add(sbuSub.id);
        if (sbuSub.sbu_pilar !== null && sbuSub.sbu_pilar !== undefined) {
          pilarRead.add(sbuSub.sbu_pilar);
        }
      }
    }
  }

  if (directSbuRead.size > 0) {
    const sbuIds = Array.from(directSbuRead);
    const [sbuParents, sbuSubsUnderSbu] = await Promise.all([
      prismaEmployee.em_sbu.findMany({
        where: {
          id: { in: sbuIds },
          status: "A",
          OR: [{ isDeleted: false }, { isDeleted: null }]
        },
        select: { id: true, sbu_pilar: true }
      }),
      prismaEmployee.em_sbu_sub.findMany({
        where: {
          sbu_id: { in: sbuIds },
          status: "A",
          OR: [{ isDeleted: false }, { isDeleted: null }]
        },
        select: { id: true }
      })
    ]);

    for (const sbu of sbuParents) {
      if (sbu.sbu_pilar !== null && sbu.sbu_pilar !== undefined) {
        pilarRead.add(sbu.sbu_pilar);
      }
    }

    for (const sbuSub of sbuSubsUnderSbu) {
      sbuSubRead.add(sbuSub.id);
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
