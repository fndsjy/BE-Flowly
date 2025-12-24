import { type UpdateEmployeeJobDescRequest } from "../model/employee-model.js";
export declare class EmployeeService {
    static listForPIC(): Promise<import("../model/employee-model.js").EmployeeResponse[]>;
    static updateJobDesc(requesterUserId: string, request: UpdateEmployeeJobDescRequest): Promise<import("../model/employee-model.js").EmployeeResponse>;
}
//# sourceMappingURL=employee-service.d.ts.map