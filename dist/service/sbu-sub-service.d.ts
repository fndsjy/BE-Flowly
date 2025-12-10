import { type CreateSbuSubRequest, type UpdateSbuSubRequest, type DeleteSbuSubRequest } from "../model/sbu-sub-model.js";
export declare class SbuSubService {
    static create(requesterId: string, reqBody: CreateSbuSubRequest): Promise<import("../model/sbu-sub-model.js").SbuSubResponse>;
    static update(requesterId: string, reqBody: UpdateSbuSubRequest): Promise<import("../model/sbu-sub-model.js").SbuSubResponse>;
    static softDelete(requesterId: string, reqBody: DeleteSbuSubRequest): Promise<{
        message: string;
    }>;
    static list(): Promise<any>;
    static getBySbu(sbuId: number): Promise<any>;
    static getByPilar(pilarId: number): Promise<any>;
}
//# sourceMappingURL=sbu-sub-service.d.ts.map