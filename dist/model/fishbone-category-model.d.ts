import type { FishboneCategory } from "../generated/flowly/client.js";
export type FishboneCategoryResponse = {
    fishboneCategoryId: string;
    categoryCode: string;
    categoryName: string;
    categoryDesc: string | null;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
};
export type FishboneCategoryListResponse = FishboneCategoryResponse;
export type CreateFishboneCategoryRequest = {
    categoryCode: string;
    categoryName: string;
    categoryDesc?: string | null;
};
export type UpdateFishboneCategoryRequest = {
    fishboneCategoryId: string;
    categoryCode?: string;
    categoryName?: string;
    categoryDesc?: string | null;
    isActive?: boolean;
};
export type DeleteFishboneCategoryRequest = {
    fishboneCategoryId: string;
};
export declare function toFishboneCategoryResponse(category: FishboneCategory): FishboneCategoryResponse;
export declare const toFishboneCategoryListResponse: typeof toFishboneCategoryResponse;
//# sourceMappingURL=fishbone-category-model.d.ts.map