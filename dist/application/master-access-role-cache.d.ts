import type { MasterAccessRoleListResponse } from "../model/master-access-role-model.js";
export type MasterAccessRoleListCacheFilters = {
    resourceType: string | undefined;
    parentKey: string | null | undefined;
    portalKey: string | undefined;
};
export type MasterAccessRolePortalScope = {
    portalMasAccessId: string;
    menuIds: string[];
    menuKeys: string[];
    menuOrderById: Map<string, number>;
    menuOrderByKey: Map<string, number>;
};
export declare const invalidateMasterAccessRoleCaches: () => void;
export declare const withMasterAccessRoleListCache: (filters: MasterAccessRoleListCacheFilters, loader: () => Promise<MasterAccessRoleListResponse[]>) => Promise<import("../model/master-access-role-model.js").MasterAccessRoleResponse[]>;
export declare const withMasterAccessRolePortalScopeCache: (portalKey: string, loader: () => Promise<MasterAccessRolePortalScope | null>) => Promise<MasterAccessRolePortalScope | null>;
//# sourceMappingURL=master-access-role-cache.d.ts.map