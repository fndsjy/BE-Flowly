import { prismaFlowly, prismaEmployee } from "../application/database.js";
import { ResponseError } from "../error/response-error.js";
import { toEmployeeResponse } from "../model/employee-model.js";
import { Validation } from "../validation/validation.js";
import { EmployeeValidation } from "../validation/employee-validation.js";
export class EmployeeService {
    static async listForPIC() {
        // 1. Cek user + role
        // const requester = await prismaFlowly.user.findUnique({
        //   where: { userId: requesterUserId, isDeleted: false },
        //   include: { role: true },
        // });
        // if (!requester) throw new ResponseError(404, "User not found");
        // if (requester.role.roleLevel !== 1) {
        //   throw new ResponseError(403, "Only admin can access this resource");
        // }
        // 2. Ambil employee di DB employee
        const employees = await prismaEmployee.em_employee.findMany({
            select: {
                UserId: true,
                Name: true,
                jobDesc: true,
            },
            orderBy: {
                Name: "asc",
            },
        });
        return employees.map(toEmployeeResponse);
    }
    static async updateJobDesc(requesterUserId, request) {
        const updateReq = Validation.validate(EmployeeValidation.UPDATE_JOB_DESC, request);
        const requester = await prismaFlowly.user.findUnique({
            where: { userId: requesterUserId },
            include: { role: true }
        });
        if (!requester || requester.role.roleLevel !== 1) {
            throw new ResponseError(403, "Only admin can update employee job description");
        }
        const employee = await prismaEmployee.em_employee.findUnique({
            where: { UserId: updateReq.userId }
        });
        if (!employee)
            throw new ResponseError(404, "Employee not found");
        let normalizedJobDesc = updateReq.jobDesc;
        if (normalizedJobDesc !== null) {
            const trimmed = normalizedJobDesc.trim();
            normalizedJobDesc = trimmed.length > 0 ? trimmed : null;
        }
        const updated = await prismaEmployee.em_employee.update({
            where: { UserId: updateReq.userId },
            data: {
                jobDesc: normalizedJobDesc,
                Lastupdate: new Date(),
            }
        });
        return toEmployeeResponse(updated);
    }
}
//# sourceMappingURL=employee-service.js.map