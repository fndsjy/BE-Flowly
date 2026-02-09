import { type CreateFishboneRequest, type UpdateFishboneRequest, type DeleteFishboneRequest } from "../model/fishbone-model.js";
export declare class FishboneService {
    static create(requesterId: string, reqBody: CreateFishboneRequest): Promise<import("../model/fishbone-model.js").FishboneResponse>;
    static update(requesterId: string, reqBody: UpdateFishboneRequest): Promise<import("../model/fishbone-model.js").FishboneResponse>;
    static softDelete(requesterId: string, reqBody: DeleteFishboneRequest): Promise<{
        message: string;
    }>;
    static list(requesterId: string, filters?: {
        fishboneId?: string;
        sbuSubId?: number;
    }): Promise<import("../model/fishbone-model.js").FishboneResponse[]>;
}
//# sourceMappingURL=fishbone-service.d.ts.map