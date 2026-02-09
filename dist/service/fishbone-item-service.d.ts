import { type CreateFishboneItemRequest, type UpdateFishboneItemRequest, type DeleteFishboneItemRequest } from "../model/fishbone-item-model.js";
export declare class FishboneItemService {
    static create(requesterId: string, reqBody: CreateFishboneItemRequest): Promise<import("../model/fishbone-item-model.js").FishboneItemResponse>;
    static update(requesterId: string, reqBody: UpdateFishboneItemRequest): Promise<import("../model/fishbone-item-model.js").FishboneItemResponse>;
    static softDelete(requesterId: string, reqBody: DeleteFishboneItemRequest): Promise<{
        message: string;
    }>;
    static list(requesterId: string, filters?: {
        fishboneId?: string;
        categoryCode?: string;
    }): Promise<import("../model/fishbone-item-model.js").FishboneItemResponse[]>;
}
//# sourceMappingURL=fishbone-item-service.d.ts.map