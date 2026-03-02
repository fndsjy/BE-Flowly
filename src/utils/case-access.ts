import { prismaEmployee, prismaFlowly } from "../application/database.js";
import { ResponseError } from "../error/response-error.js";
import { canCrudModule, canReadModule, getModuleAccessMap } from "./access-scope.js";

export type CaseAccess = {
  actorType: "FLOWLY" | "EMPLOYEE";
  requesterId: string;
  employeeId?: number;
  canRead: boolean;
  canCrud: boolean;
};

const resolveEmployeeId = async (
  userId: string,
  flowlyUser?: { badgeNumber?: string | null } | null
): Promise<number | null> => {
  const numericId = Number(userId);
  if (!Number.isNaN(numericId)) {
    const employee = await prismaEmployee.em_employee.findUnique({
      where: { UserId: numericId },
      select: { UserId: true },
    });
    if (employee) {
      return employee.UserId;
    }
  }

  const badgeNumber = flowlyUser?.badgeNumber?.trim();
  if (!badgeNumber) {
    return null;
  }

  const employee = await prismaEmployee.em_employee.findFirst({
    where: { BadgeNum: badgeNumber },
    select: { UserId: true },
  });

  return employee?.UserId ?? null;
};

export const resolveCaseAccess = async (requesterId: string): Promise<CaseAccess> => {
  const flowlyUser = await prismaFlowly.user.findUnique({
    where: { userId: requesterId, isDeleted: false },
    include: { role: true },
  });

  if (flowlyUser) {
    const isAdmin = flowlyUser.role?.roleLevel === 1;
    if (isAdmin) {
      return {
        actorType: "FLOWLY",
        requesterId,
        canRead: true,
        canCrud: true,
      };
    }

    const moduleAccessMap = await getModuleAccessMap(requesterId);
    const canCrud = canCrudModule(moduleAccessMap, "CASE");
    const canRead = canReadModule(moduleAccessMap, "CASE") || canCrud;

    if (!canRead) {
      const employeeId = await resolveEmployeeId(requesterId, flowlyUser);
      if (employeeId !== null) {
        return {
          actorType: "EMPLOYEE",
          requesterId,
          employeeId,
          canRead: true,
          canCrud: false,
        };
      }
    }

    return {
      actorType: "FLOWLY",
      requesterId,
      canRead,
      canCrud,
    };
  }

  const employeeId = await resolveEmployeeId(requesterId, null);
  if (employeeId === null) {
    throw new ResponseError(401, "Unauthorized");
  }

  return {
    actorType: "EMPLOYEE",
    requesterId,
    employeeId,
    canRead: true,
    canCrud: false,
  };
};

export const assertCaseRead = (access: CaseAccess) => {
  if (access.actorType === "FLOWLY" && !access.canRead) {
    throw new ResponseError(403, "Module CASE access required");
  }
};

export const assertCaseCrud = (access: CaseAccess) => {
  if (access.actorType === "FLOWLY" && !access.canCrud) {
    throw new ResponseError(403, "Module CASE CRUD access required");
  }
};

export const isPicForSbuSub = async (
  employeeId: number,
  sbuSubId: number
): Promise<boolean> => {
  const pic = await prismaEmployee.em_sbu_sub.findFirst({
    where: {
      id: sbuSubId,
      pic: employeeId,
      status: "A",
      OR: [{ isDeleted: false }, { isDeleted: null }],
    },
    select: { id: true },
  });

  return Boolean(pic);
};

export const getEmployeeChartSbuSubIds = async (employeeId: number) => {
  const members = await prismaFlowly.chartMember.findMany({
    where: {
      userId: employeeId,
      isDeleted: false,
      node: { isDeleted: false },
    },
    select: {
      node: { select: { sbuSubId: true } },
    },
  });

  const ids = members
    .map((member) => member.node?.sbuSubId)
    .filter((id): id is number => Number.isFinite(id));

  return Array.from(new Set(ids));
};

export const ensureCaseNotClosed = async (caseId: string) => {
  const caseHeader = await prismaFlowly.caseHeader.findUnique({
    where: { caseId },
    select: {
      caseId: true,
      isDeleted: true,
      feedbackApprovedAt: true,
    },
  });

  if (!caseHeader || caseHeader.isDeleted) {
    throw new ResponseError(404, "Case not found");
  }

  if (caseHeader.feedbackApprovedAt) {
    throw new ResponseError(400, "Case already closed");
  }

  return caseHeader;
};
