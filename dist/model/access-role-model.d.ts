export type AccessRoleResponse = {
    accessId: string;
    subjectType: string;
    subjectId: string;
    resourceType: string;
    masAccessId: string | null;
    resourceKey: string | null;
    accessLevel: string;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
};
export type AccessRoleListResponse = AccessRoleResponse;
export type CreateAccessRoleRequest = {
    subjectType: string;
    subjectId: string;
    resourceType: string;
    masAccessId?: string | null;
    resourceKey?: string | null;
    accessLevel: string;
    isActive?: boolean;
};
export type UpdateAccessRoleRequest = {
    accessId: string;
    subjectType?: string;
    subjectId?: string;
    resourceType?: string;
    masAccessId?: string | null;
    resourceKey?: string | null;
    accessLevel?: string;
    isActive?: boolean;
};
export type DeleteAccessRoleRequest = {
    accessId: string;
};
export declare function toAccessRoleResponse(a: any): AccessRoleResponse;
export declare const toAccessRoleListResponse: typeof toAccessRoleResponse;
export type AccessRoleSummaryItem = {
    resourceType: string;
    resourceKey: string;
    accessLevel: string;
};
export type OrgAccessSummary = {
    pilarRead: number[];
    pilarCrud: number[];
    sbuRead: number[];
    sbuCrud: number[];
    sbuSubRead: number[];
    sbuSubCrud: number[];
};
export type AccessRoleSummaryResponse = {
    isAdmin: boolean;
    menuAccess: AccessRoleSummaryItem[];
    moduleAccess: AccessRoleSummaryItem[];
    focusPilarIds?: number[];
    orgScope: {
        pilarRead: boolean;
        pilarCrud: boolean;
        sbuRead: boolean;
        sbuCrud: boolean;
        sbuSubRead: boolean;
        sbuSubCrud: boolean;
    };
    orgAccess: OrgAccessSummary;
};
//# sourceMappingURL=access-role-model.d.ts.map