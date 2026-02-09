import { type CreateFishboneCauseRequest, type UpdateFishboneCauseRequest, type DeleteFishboneCauseRequest } from "../model/fishbone-cause-model.js";
export declare class FishboneCauseService {
    static create(requesterId: string, reqBody: CreateFishboneCauseRequest): Promise<import("../model/fishbone-cause-model.js").FishboneCauseResponse>;
    static update(requesterId: string, reqBody: UpdateFishboneCauseRequest): Promise<import("../model/fishbone-cause-model.js").FishboneCauseResponse>;
    static softDelete(requesterId: string, reqBody: DeleteFishboneCauseRequest): Promise<{
        message: string;
    }>;
    static list(requesterId: string, filters?: {
        fishboneId?: string;
    }): Promise<import("../model/fishbone-cause-model.js").FishboneCauseResponse[]>;
}
//# sourceMappingURL=fishbone-cause-service.d.ts.map