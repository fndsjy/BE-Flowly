import { prismaEmployee, prismaFlowly } from "../application/database.js";
import { ResponseError } from "../error/response-error.js";

export type ProcedureAccess = {
  actorType: "FLOWLY" | "EMPLOYEE";
  roleLevel?: number;
  canCrud: boolean;
};

export const getProcedureAccess = async (requesterId: string): Promise<ProcedureAccess> => {
  const flowlyUser = await prismaFlowly.user.findUnique({
    where: { userId: requesterId, isDeleted: false },
    include: { role: true },
  });

  if (flowlyUser) {
    const roleLevel = flowlyUser.role?.roleLevel ?? 4;
    return {
      actorType: "FLOWLY",
      roleLevel,
      canCrud: roleLevel >= 1 && roleLevel <= 3,
    };
  }

  const employeeId = Number(requesterId);
  if (Number.isNaN(employeeId)) {
    throw new ResponseError(401, "Unauthorized");
  }

  const employee = await prismaEmployee.em_employee.findUnique({
    where: { UserId: employeeId },
    select: { UserId: true },
  });

  if (!employee) {
    throw new ResponseError(401, "Unauthorized");
  }

  return {
    actorType: "EMPLOYEE",
    canCrud: false,
  };
};

export const assertProcedureCrud = (access: ProcedureAccess) => {
  if (!access.canCrud) {
    throw new ResponseError(403, "Role level 1-3 required for CRUD");
  }
};
