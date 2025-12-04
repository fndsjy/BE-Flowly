import { type CreateSbuRequest, type UpdateSbuRequest, type DeleteSbuRequest } from "../model/sbu-model.js";
export declare class SbuService {
    static create(requesterId: string, reqBody: CreateSbuRequest): Promise<import("../model/sbu-model.js").SbuResponse>;
    static update(requesterId: string, reqBody: UpdateSbuRequest): Promise<import("../model/sbu-model.js").SbuResponse>;
    static softDelete(requesterId: string, reqBody: DeleteSbuRequest): Promise<{
        message: string;
    }>;
    static list(): Promise<any>;
    static getByPilar(pilarId: number): Promise<any>;
}
//# sourceMappingURL=sbu-service.d.ts.map