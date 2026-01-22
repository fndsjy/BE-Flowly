import { type CreateSbuRequest, type UpdateSbuRequest, type DeleteSbuRequest } from "../model/sbu-model.js";
export declare class SbuService {
    static create(requesterId: string, reqBody: CreateSbuRequest): Promise<import("../model/sbu-model.js").SbuResponse>;
    static update(requesterId: string, reqBody: UpdateSbuRequest): Promise<import("../model/sbu-model.js").SbuResponse>;
    static softDelete(requesterId: string, reqBody: DeleteSbuRequest): Promise<{
        message: string;
    }>;
    static list(requesterId: string): Promise<import("../model/sbu-model.js").SbuResponse[]>;
    static listPublic(_requesterId: string): Promise<import("../model/sbu-model.js").SbuResponse[]>;
    static getByPilar(requesterId: string, pilarId: number): Promise<import("../model/sbu-model.js").SbuResponse[]>;
}
//# sourceMappingURL=sbu-service.d.ts.map