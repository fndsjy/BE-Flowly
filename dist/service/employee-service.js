import { prismaFlowly, prismaEmployee } from "../application/database.js";
import { ResponseError } from "../error/response-error.js";
import { toEmployeeResponse } from "../model/employee-model.js";
export class EmployeeService {
    static async listForPIC(requesterUserId) {
        // 1. Cek user + role
        const requester = await prismaFlowly.user.findUnique({
            where: { userId: requesterUserId, isDeleted: false },
            include: { role: true },
        });
        if (!requester)
            throw new ResponseError(404, "User not found");
        if (requester.role.roleLevel !== 1) {
            throw new ResponseError(403, "Only admin can access this resource");
        }
        // 2. Ambil employee di DB employee
        const employees = await prismaEmployee.em_employee.findMany({
            select: {
                UserId: true,
                Name: true,
            },
            orderBy: {
                Name: "asc",
            },
        });
        return employees.map(toEmployeeResponse);
    }
}
//# sourceMappingURL=employee-service.js.map