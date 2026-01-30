import { type CreateMasterIkRequest, type UpdateMasterIkRequest, type DeleteMasterIkRequest } from "../model/master-ik-model.js";
export declare class MasterIkService {
    static create(requesterId: string, reqBody: CreateMasterIkRequest): Promise<import("../model/master-ik-model.js").MasterIkResponse>;
    static update(requesterId: string, reqBody: UpdateMasterIkRequest): Promise<import("../model/master-ik-model.js").MasterIkResponse>;
    static softDelete(requesterId: string, reqBody: DeleteMasterIkRequest): Promise<{
        message: string;
    }>;
    static list(requesterId: string, filters?: {
        sopId?: string;
    }): Promise<import("../model/master-ik-model.js").MasterIkResponse[]>;
}
//# sourceMappingURL=master-ik-service.d.ts.map