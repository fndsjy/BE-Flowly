import type { FishboneItem, FishboneItemCause, FishboneCause } from "../generated/flowly/client.js";
export type FishboneItemCauseInfo = {
    fishboneCauseId: string;
    causeNo: number;
    causeText: string;
    isActive: boolean;
    isDeleted: boolean;
};
export type FishboneItemResponse = {
    fishboneItemId: string;
    fishboneId: string;
    categoryCode: string;
    problemText: string;
    solutionText: string;
    causes: FishboneItemCauseInfo[];
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
};
export type FishboneItemListResponse = FishboneItemResponse;
export type CreateFishboneItemRequest = {
    fishboneId: string;
    categoryCode: string;
    problemText: string;
    solutionText: string;
    causeIds: string[];
};
export type UpdateFishboneItemRequest = {
    fishboneItemId: string;
    categoryCode?: string;
    problemText?: string;
    solutionText?: string;
    isActive?: boolean;
    causeIds?: string[];
};
export type DeleteFishboneItemRequest = {
    fishboneItemId: string;
};
type FishboneCauseLite = Pick<FishboneCause, "fishboneCauseId" | "causeNo" | "causeText" | "isActive" | "isDeleted">;
type FishboneItemRecord = FishboneItem & {
    causeLinks?: Array<FishboneItemCause & {
        cause?: FishboneCauseLite | null;
    }>;
};
export declare function toFishboneItemResponse(item: FishboneItemRecord): FishboneItemResponse;
export declare const toFishboneItemListResponse: typeof toFishboneItemResponse;
export {};
//# sourceMappingURL=fishbone-item-model.d.ts.map