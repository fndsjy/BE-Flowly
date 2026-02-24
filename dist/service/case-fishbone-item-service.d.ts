import { type CreateCaseFishboneItemRequest, type UpdateCaseFishboneItemRequest, type DeleteCaseFishboneItemRequest } from "../model/case-fishbone-item-model.js";
export declare class CaseFishboneItemService {
    static create(requesterId: string, reqBody: CreateCaseFishboneItemRequest): Promise<import("../model/case-fishbone-item-model.js").CaseFishboneItemResponse>;
    static update(requesterId: string, reqBody: UpdateCaseFishboneItemRequest): Promise<import("../model/case-fishbone-item-model.js").CaseFishboneItemResponse>;
    static softDelete(requesterId: string, reqBody: DeleteCaseFishboneItemRequest): Promise<{
        message: string;
    }>;
    static list(requesterId: string, filters?: {
        caseFishboneId?: string;
        categoryCode?: string;
    }): Promise<import("../model/case-fishbone-item-model.js").CaseFishboneItemResponse[]>;
}
//# sourceMappingURL=case-fishbone-item-service.d.ts.map