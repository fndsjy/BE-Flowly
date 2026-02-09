import { type CreateFishboneCategoryRequest, type UpdateFishboneCategoryRequest, type DeleteFishboneCategoryRequest } from "../model/fishbone-category-model.js";
export declare class FishboneCategoryService {
    static create(requesterId: string, reqBody: CreateFishboneCategoryRequest): Promise<import("../model/fishbone-category-model.js").FishboneCategoryResponse>;
    static update(requesterId: string, reqBody: UpdateFishboneCategoryRequest): Promise<import("../model/fishbone-category-model.js").FishboneCategoryResponse>;
    static softDelete(requesterId: string, reqBody: DeleteFishboneCategoryRequest): Promise<{
        message: string;
    }>;
    static list(requesterId: string, filters?: {
        categoryCode?: string;
    }): Promise<import("../model/fishbone-category-model.js").FishboneCategoryResponse[]>;
}
//# sourceMappingURL=fishbone-category-service.d.ts.map