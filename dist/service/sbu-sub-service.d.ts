import { type CreateSbuSubRequest, type UpdateSbuSubRequest, type DeleteSbuSubRequest } from "../model/sbu-sub-model.js";
export declare class SbuSubService {
    static create(requesterId: string, reqBody: CreateSbuSubRequest): Promise<import("../model/sbu-sub-model.js").SbuSubResponse>;
    static update(requesterId: string, reqBody: UpdateSbuSubRequest): Promise<import("../model/sbu-sub-model.js").SbuSubResponse>;
    static softDelete(requesterId: string, reqBody: DeleteSbuSubRequest): Promise<{
        message: string;
    }>;
    static list(requesterId: string): Promise<import("../model/sbu-sub-model.js").SbuSubResponse[]>;
    static getBySbu(requesterId: string, sbuId: number): Promise<import("../model/sbu-sub-model.js").SbuSubResponse[]>;
    static getByPilar(requesterId: string, pilarId: number): Promise<import("../model/sbu-sub-model.js").SbuSubResponse[]>;
}
//# sourceMappingURL=sbu-sub-service.d.ts.map