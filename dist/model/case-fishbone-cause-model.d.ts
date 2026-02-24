import type { CaseFishboneCause } from "../generated/flowly/client.js";
export type CaseFishboneCauseResponse = {
    caseFishboneCauseId: string;
    caseFishboneId: string;
    causeNo: number;
    causeText: string;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
};
export type CaseFishboneCauseListResponse = CaseFishboneCauseResponse;
export type CreateCaseFishboneCauseRequest = {
    caseFishboneId: string;
    causeNo: number;
    causeText: string;
};
export type UpdateCaseFishboneCauseRequest = {
    caseFishboneCauseId: string;
    causeNo?: number;
    causeText?: string;
    isActive?: boolean;
};
export type DeleteCaseFishboneCauseRequest = {
    caseFishboneCauseId: string;
};
export declare function toCaseFishboneCauseResponse(cause: CaseFishboneCause): CaseFishboneCauseResponse;
export declare const toCaseFishboneCauseListResponse: typeof toCaseFishboneCauseResponse;
//# sourceMappingURL=case-fishbone-cause-model.d.ts.map