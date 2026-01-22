import type { ProcedureSop } from "../generated/flowly/client.js";
export type ProcedureSopResponse = {
    sopId: string;
    sbuSubId: number;
    sbuId: number | null;
    pilarId: number | null;
    sopName: string;
    sopNumber: string;
    effectiveDate: Date;
    filePath: string;
    fileName: string;
    fileMime: string | null;
    fileSize: number | null;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
};
export type ProcedureSopListResponse = ProcedureSopResponse;
export type CreateProcedureSopRequest = {
    sbuSubId: number;
    sopName: string;
    sopNumber: string;
    effectiveDate: Date | string;
    filePath: string;
    fileName: string;
    fileMime?: string | null;
    fileSize?: number | null;
};
export type UpdateProcedureSopRequest = {
    sopId: string;
    sopName?: string;
    sopNumber?: string;
    effectiveDate?: Date | string;
    filePath?: string;
    fileName?: string;
    fileMime?: string | null;
    fileSize?: number | null;
    isActive?: boolean;
};
export type DeleteProcedureSopRequest = {
    sopId: string;
};
export declare function toProcedureSopResponse(sop: ProcedureSop): ProcedureSopResponse;
export declare const toProcedureSopListResponse: typeof toProcedureSopResponse;
//# sourceMappingURL=procedure-sop-model.d.ts.map