import { prismaFlowly } from "../application/database.js";
import { ResponseError } from "../error/response-error.js";

export type HrdAccessLevel = "READ" | "CRUD";

const normalizeAccessLevel = (value: string) => {
  const upper = value.trim().toUpperCase();
  return upper === "FULL" ? "CRUD" : upper;
};

export const resolveHrdAccessLevel = async (
  requesterUserId: string
): Promise<HrdAccessLevel> => {
  const requester = await prismaFlowly.user.findUnique({
    where: { userId: requesterUserId },
    include: { role: true },
  });

  if (!requester) {
    throw new ResponseError(401, "Unauthorized");
  }

  if (requester.role.roleLevel === 1) {
    return "CRUD";
  }

  const masterMenu = await prismaFlowly.masterAccessRole.findUnique({
    where: {
      resourceType_resourceKey: {
        resourceType: "MENU",
        resourceKey: "HRD",
      },
    },
    select: { masAccessId: true },
  });

  const subjectFilters = [{ subjectType: "USER", subjectId: requesterUserId }];
  if (requester.roleId) {
    subjectFilters.unshift({ subjectType: "ROLE", subjectId: requester.roleId });
  }

  const accessRoles = await prismaFlowly.accessRole.findMany({
    where: {
      isDeleted: false,
      resourceType: "MENU",
      OR: subjectFilters,
      ...(masterMenu
        ? {
            AND: [
              {
                OR: [{ resourceKey: "HRD" }, { masAccessId: masterMenu.masAccessId }],
              },
            ],
          }
        : { resourceKey: "HRD" }),
    },
    select: {
      subjectType: true,
      accessLevel: true,
      isActive: true,
    },
  });

  let finalLevel: HrdAccessLevel | null = null;
  const applyLevel = (level: string, override: boolean) => {
    const normalized = normalizeAccessLevel(level);
    if (normalized !== "READ" && normalized !== "CRUD") {
      return;
    }

    if (!finalLevel || override) {
      finalLevel = normalized;
      return;
    }

    if (finalLevel === "READ" && normalized === "CRUD") {
      finalLevel = normalized;
    }
  };

  for (const access of accessRoles.filter((item) => item.subjectType === "ROLE")) {
    if (!access.isActive) {
      continue;
    }
    applyLevel(access.accessLevel, false);
  }

  for (const access of accessRoles.filter((item) => item.subjectType === "USER")) {
    if (!access.isActive) {
      finalLevel = null;
      continue;
    }
    applyLevel(access.accessLevel, true);
  }

  if (!finalLevel) {
    throw new ResponseError(403, "Menu HRD access required");
  }

  return finalLevel;
};

export const ensureHrdReadAccess = async (requesterUserId: string) => {
  await resolveHrdAccessLevel(requesterUserId);
};

export const ensureHrdCrudAccess = async (requesterUserId: string) => {
  const level = await resolveHrdAccessLevel(requesterUserId);
  if (level !== "CRUD") {
    throw new ResponseError(403, "Menu HRD CRUD access required");
  }
};
