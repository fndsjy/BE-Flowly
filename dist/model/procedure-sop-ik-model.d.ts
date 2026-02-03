import type { ProcedureSopIK, MasterIK, ProcedureSop } from "../generated/flowly/client.js";
export type ProcedureSopIkResponse = {
    sopIkId: string;
    sopId: string;
    ikId: string;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    sopName: string | null;
    sopNumber: string | null;
    ikName: string | null;
    ikNumber: string | null;
    ikEffectiveDate: Date | null;
    ikIsActive: boolean | null;
};
export type ProcedureSopIkListResponse = ProcedureSopIkResponse;
export type CreateProcedureSopIkRequest = {
    sopId: string;
    ikIds: string[];
};
export type UpdateProcedureSopIkRequest = {
    sopIkId: string;
    isActive?: boolean;
};
export type DeleteProcedureSopIkRequest = {
    sopIkId: string;
};
type ProcedureSopIkRecord = ProcedureSopIK & {
    masterIK?: Pick<MasterIK, "ikId" | "ikName" | "ikNumber" | "effectiveDate" | "isActive"> | null;
    sop?: Pick<ProcedureSop, "sopId" | "sopName" | "sopNumber"> | null;
};
export declare function toProcedureSopIkResponse(link: ProcedureSopIkRecord): ProcedureSopIkResponse;
export declare const toProcedureSopIkListResponse: typeof toProcedureSopIkResponse;
export {};
//# sourceMappingURL=procedure-sop-ik-model.d.ts.map