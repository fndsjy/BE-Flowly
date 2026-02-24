import type { CaseFishboneMaster } from "../generated/flowly/client.js";
export type CaseFishboneResponse = {
    caseFishboneId: string;
    caseId: string;
    sbuSubId: number;
    fishboneName: string;
    fishboneDesc: string | null;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
};
export type CaseFishboneListResponse = CaseFishboneResponse;
export type CreateCaseFishboneRequest = {
    caseId: string;
    sbuSubId: number;
    fishboneName: string;
    fishboneDesc?: string | null;
};
export type UpdateCaseFishboneRequest = {
    caseFishboneId: string;
    fishboneName?: string;
    fishboneDesc?: string | null;
    isActive?: boolean;
};
export type DeleteCaseFishboneRequest = {
    caseFishboneId: string;
};
export declare function toCaseFishboneResponse(fishbone: CaseFishboneMaster): CaseFishboneResponse;
export declare const toCaseFishboneListResponse: typeof toCaseFishboneResponse;
//# sourceMappingURL=case-fishbone-model.d.ts.map