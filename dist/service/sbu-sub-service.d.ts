import { type CreateSbuSubRequest, type UpdateSbuSubRequest, type DeleteSbuSubRequest } from "../model/sbu-sub-model.js";
export declare class SbuSubService {
    static create(requesterId: string, reqBody: CreateSbuSubRequest): Promise<import("../model/sbu-sub-model.js").SbuSubResponse>;
    static update(requesterId: string, reqBody: UpdateSbuSubRequest): Promise<import("../model/sbu-sub-model.js").SbuSubResponse>;
    static softDelete(requesterId: string, reqBody: DeleteSbuSubRequest): Promise<{
        message: string;
    }>;
    static list(): Promise<import("../model/sbu-sub-model.js").SbuSubResponse[]>;
    static getBySbu(sbuId: number): Promise<import("../model/sbu-sub-model.js").SbuSubResponse[]>;
    static getByPilar(pilarId: number): Promise<import("../model/sbu-sub-model.js").SbuSubResponse[]>;
}
//# sourceMappingURL=sbu-sub-service.d.ts.map