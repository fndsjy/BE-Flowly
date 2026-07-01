import { type CreateMasterIkRequest, type UpdateMasterIkRequest, type DeleteMasterIkRequest, type MasterIkListFilters } from "../model/master-ik-model.js";
export declare class MasterIkService {
    static create(requesterId: string, reqBody: CreateMasterIkRequest): Promise<import("../model/master-ik-model.js").MasterIkResponse>;
    static update(requesterId: string, reqBody: UpdateMasterIkRequest): Promise<import("../model/master-ik-model.js").MasterIkResponse>;
    static softDelete(requesterId: string, reqBody: DeleteMasterIkRequest): Promise<{
        message: string;
    }>;
    static list(requesterId: string, filters?: MasterIkListFilters): Promise<import("../model/master-ik-model.js").MasterIkResponse[] | {
        data: import("../model/master-ik-model.js").MasterIkResponse[];
        page: number;
        pageSize: number;
        total: number;
        activeTotal: number;
    }>;
}
//# sourceMappingURL=master-ik-service.d.ts.map