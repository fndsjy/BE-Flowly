import type { CaseFishboneItem, CaseFishboneItemCause, CaseFishboneCause } from "../generated/flowly/client.js";
export type CaseFishboneItemCauseInfo = {
    caseFishboneCauseId: string;
    causeNo: number;
    causeText: string;
    isActive: boolean;
    isDeleted: boolean;
};
export type CaseFishboneItemResponse = {
    caseFishboneItemId: string;
    caseFishboneId: string;
    categoryCode: string;
    problemText: string;
    solutionText: string;
    causes: CaseFishboneItemCauseInfo[];
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
};
export type CaseFishboneItemListResponse = CaseFishboneItemResponse;
export type CreateCaseFishboneItemRequest = {
    caseFishboneId: string;
    categoryCode: string;
    problemText: string;
    solutionText: string;
    causeIds: string[];
};
export type UpdateCaseFishboneItemRequest = {
    caseFishboneItemId: string;
    categoryCode?: string;
    problemText?: string;
    solutionText?: string;
    isActive?: boolean;
    causeIds?: string[];
};
export type DeleteCaseFishboneItemRequest = {
    caseFishboneItemId: string;
};
type CaseFishboneCauseLite = Pick<CaseFishboneCause, "caseFishboneCauseId" | "causeNo" | "causeText" | "isActive" | "isDeleted">;
type CaseFishboneItemRecord = CaseFishboneItem & {
    causeLinks?: Array<CaseFishboneItemCause & {
        cause?: CaseFishboneCauseLite | null;
    }>;
};
export declare function toCaseFishboneItemResponse(item: CaseFishboneItemRecord): CaseFishboneItemResponse;
export declare const toCaseFishboneItemListResponse: typeof toCaseFishboneItemResponse;
export {};
//# sourceMappingURL=case-fishbone-item-model.d.ts.map