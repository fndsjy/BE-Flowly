import { type CreateAccessRoleRequest, type UpdateAccessRoleRequest, type DeleteAccessRoleRequest, type AccessRoleSummaryResponse } from "../model/access-role-model.js";
export declare class AccessRoleService {
    static create(requesterId: string, reqBody: CreateAccessRoleRequest): Promise<import("../model/access-role-model.js").AccessRoleResponse>;
    static update(requesterId: string, reqBody: UpdateAccessRoleRequest): Promise<import("../model/access-role-model.js").AccessRoleResponse>;
    static softDelete(requesterId: string, reqBody: DeleteAccessRoleRequest): Promise<{
        message: string;
    }>;
    static list(requesterId: string, filters: {
        subjectType?: string;
        subjectId?: string;
        resourceType?: string;
        resourceKey?: string;
        masAccessId?: string;
        isActive?: boolean;
    }): Promise<import("../model/access-role-model.js").AccessRoleResponse[]>;
    static getSummary(requesterId: string): Promise<AccessRoleSummaryResponse>;
}
//# sourceMappingURL=access-role-service.d.ts.map