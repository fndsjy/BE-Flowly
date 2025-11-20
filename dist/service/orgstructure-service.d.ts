import { type CreateOrgStructureRequest, type UpdateOrgStructureRequest, type DeleteOrgStructureRequest } from "../model/orgstructure-model.js";
export declare class OrgStructureService {
    static create(requesterId: string, reqBody: CreateOrgStructureRequest): Promise<import("../model/orgstructure-model.js").OrgStructureResponse>;
    static update(requesterId: string, reqBody: UpdateOrgStructureRequest): Promise<import("../model/orgstructure-model.js").OrgStructureResponse>;
    static softDelete(requesterId: string, reqBody: DeleteOrgStructureRequest): Promise<{
        message: string;
    }>;
    static list(): Promise<import("../model/orgstructure-model.js").OrgStructureListResponse[]>;
}
//# sourceMappingURL=orgstructure-service.d.ts.map