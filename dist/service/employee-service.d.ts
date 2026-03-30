import { type CreateEmployeeRequest, type DeleteEmployeeRequest, type UpdateEmployeeJobDescRequest, type UpdateEmployeeRequest } from "../model/employee-model.js";
export declare class EmployeeService {
    static listForPIC(): Promise<import("../model/employee-model.js").EmployeeResponse[]>;
    static listDepartments(): Promise<import("../model/employee-model.js").EmployeeDepartmentResponse[]>;
    static create(requesterUserId: string, request: CreateEmployeeRequest): Promise<import("../model/employee-model.js").EmployeeResponse>;
    static update(requesterUserId: string, request: UpdateEmployeeRequest): Promise<import("../model/employee-model.js").EmployeeResponse>;
    static remove(requesterUserId: string, request: DeleteEmployeeRequest): Promise<{
        message: string;
    }>;
    static updateJobDesc(requesterUserId: string, request: UpdateEmployeeJobDescRequest): Promise<import("../model/employee-model.js").EmployeeResponse>;
}
//# sourceMappingURL=employee-service.d.ts.map