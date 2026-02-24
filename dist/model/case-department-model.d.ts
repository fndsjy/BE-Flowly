import type { CaseDepartment } from "../generated/flowly/client.js";
export type CaseDepartmentResponse = {
    caseDepartmentId: string;
    caseId: string;
    sbuSubId: number;
    decisionStatus: string;
    decisionAt: Date | null;
    decisionBy: string | null;
    assigneeEmployeeId: number | null;
    assignedAt: Date | null;
    assignedBy: string | null;
    workStatus: string | null;
    startDate: Date | null;
    targetDate: Date | null;
    endDate: Date | null;
    workNotes: string | null;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
};
export type CaseDepartmentListResponse = CaseDepartmentResponse;
export type CreateCaseDepartmentRequest = {
    caseId: string;
    sbuSubId: number;
};
export type UpdateCaseDepartmentRequest = {
    caseDepartmentId: string;
    decisionStatus?: string;
    assigneeEmployeeId?: number | null;
    workStatus?: string | null;
    startDate?: Date | string | null;
    targetDate?: Date | string | null;
    endDate?: Date | string | null;
    workNotes?: string | null;
    isActive?: boolean;
};
export type DeleteCaseDepartmentRequest = {
    caseDepartmentId: string;
};
export declare function toCaseDepartmentResponse(department: CaseDepartment): CaseDepartmentResponse;
export declare const toCaseDepartmentListResponse: typeof toCaseDepartmentResponse;
//# sourceMappingURL=case-department-model.d.ts.map