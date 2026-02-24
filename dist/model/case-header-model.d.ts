import type { CaseHeader } from "../generated/flowly/client.js";
export type CaseHeaderResponse = {
    caseId: string;
    caseType: string;
    caseTitle: string;
    background: string | null;
    currentCondition: string | null;
    projectDesc: string | null;
    projectObjective: string | null;
    locationDesc: string | null;
    notes: string | null;
    status: string;
    requesterId: string | null;
    requesterEmployeeId: number | null;
    originSbuSubId: number | null;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
};
export type CaseHeaderListResponse = CaseHeaderResponse;
export type CreateCaseHeaderRequest = {
    caseType: string;
    caseTitle: string;
    background?: string | null;
    currentCondition?: string | null;
    projectDesc?: string | null;
    projectObjective?: string | null;
    locationDesc?: string | null;
    notes?: string | null;
    originSbuSubId?: number;
    departmentSbuSubIds: number[];
};
export type UpdateCaseHeaderRequest = {
    caseId: string;
    caseType?: string;
    caseTitle?: string;
    background?: string | null;
    currentCondition?: string | null;
    projectDesc?: string | null;
    projectObjective?: string | null;
    locationDesc?: string | null;
    notes?: string | null;
    status?: string;
    originSbuSubId?: number | null;
    isActive?: boolean;
};
export type DeleteCaseHeaderRequest = {
    caseId: string;
};
export declare function toCaseHeaderResponse(caseHeader: CaseHeader): CaseHeaderResponse;
export declare const toCaseHeaderListResponse: typeof toCaseHeaderResponse;
//# sourceMappingURL=case-header-model.d.ts.map