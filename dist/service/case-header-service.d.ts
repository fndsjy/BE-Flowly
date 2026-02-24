import { type CreateCaseHeaderRequest, type UpdateCaseHeaderRequest, type DeleteCaseHeaderRequest } from "../model/case-header-model.js";
export declare class CaseHeaderService {
    static create(requesterId: string, reqBody: CreateCaseHeaderRequest): Promise<import("../model/case-header-model.js").CaseHeaderResponse>;
    static update(requesterId: string, reqBody: UpdateCaseHeaderRequest): Promise<import("../model/case-header-model.js").CaseHeaderResponse>;
    static softDelete(requesterId: string, reqBody: DeleteCaseHeaderRequest): Promise<{
        message: string;
    }>;
    static list(requesterId: string, filters?: {
        caseId?: string;
        caseType?: string;
        status?: string;
        originSbuSubId?: number;
        requesterEmployeeId?: number;
        requesterId?: string;
        sbuSubId?: number;
        assigneeEmployeeId?: number;
        decisionStatus?: string;
    }): Promise<import("../model/case-header-model.js").CaseHeaderResponse[]>;
}
//# sourceMappingURL=case-header-service.d.ts.map