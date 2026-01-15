import { type CreateMasterAccessRoleRequest, type UpdateMasterAccessRoleRequest, type DeleteMasterAccessRoleRequest } from "../model/master-access-role-model.js";
export declare class MasterAccessRoleService {
    static create(requesterId: string, reqBody: CreateMasterAccessRoleRequest): Promise<import("../model/master-access-role-model.js").MasterAccessRoleResponse>;
    static update(requesterId: string, reqBody: UpdateMasterAccessRoleRequest): Promise<import("../model/master-access-role-model.js").MasterAccessRoleResponse>;
    static softDelete(requesterId: string, reqBody: DeleteMasterAccessRoleRequest): Promise<{
        message: string;
    }>;
    static list(resourceType?: string, parentKey?: string): Promise<import("../model/master-access-role-model.js").MasterAccessRoleResponse[]>;
}
//# sourceMappingURL=master-access-role-service.d.ts.map