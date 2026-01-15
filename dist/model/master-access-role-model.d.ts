export type MasterAccessRoleResponse = {
    masAccessId: string;
    resourceType: string;
    resourceKey: string;
    displayName: string;
    route: string | null;
    parentKey: string | null;
    orderIndex: number;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
};
export type MasterAccessRoleListResponse = MasterAccessRoleResponse;
export type CreateMasterAccessRoleRequest = {
    resourceType: string;
    resourceKey: string;
    displayName: string;
    route?: string | null;
    parentKey?: string | null;
    orderIndex?: number;
    isActive?: boolean;
};
export type UpdateMasterAccessRoleRequest = {
    masAccessId: string;
    resourceType?: string;
    resourceKey?: string;
    displayName?: string;
    route?: string | null;
    parentKey?: string | null;
    orderIndex?: number;
    isActive?: boolean;
};
export type DeleteMasterAccessRoleRequest = {
    masAccessId: string;
};
export declare function toMasterAccessRoleResponse(m: any): MasterAccessRoleResponse;
export declare const toMasterAccessRoleListResponse: typeof toMasterAccessRoleResponse;
//# sourceMappingURL=master-access-role-model.d.ts.map