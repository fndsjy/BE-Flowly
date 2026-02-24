import { type CreateCaseDepartmentRequest, type UpdateCaseDepartmentRequest, type DeleteCaseDepartmentRequest } from "../model/case-department-model.js";
export declare class CaseDepartmentService {
    static create(requesterId: string, reqBody: CreateCaseDepartmentRequest): Promise<import("../model/case-department-model.js").CaseDepartmentResponse>;
    static update(requesterId: string, reqBody: UpdateCaseDepartmentRequest): Promise<import("../model/case-department-model.js").CaseDepartmentResponse>;
    static softDelete(requesterId: string, reqBody: DeleteCaseDepartmentRequest): Promise<{
        message: string;
    }>;
    static list(requesterId: string, filters?: {
        caseId?: string;
        sbuSubId?: number;
        decisionStatus?: string;
        assigneeEmployeeId?: number;
    }): Promise<import("../model/case-department-model.js").CaseDepartmentResponse[]>;
}
//# sourceMappingURL=case-department-service.d.ts.map