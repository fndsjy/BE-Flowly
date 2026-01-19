export type AccessScope = {
    read: Set<number>;
    crud: Set<number>;
};
export type AccessContext = {
    isAdmin: boolean;
    pilar: AccessScope;
    sbu: AccessScope;
    sbuSub: AccessScope;
};
type AccessLevel = "READ" | "CRUD";
export type ModuleAccessMap = Map<string, AccessLevel>;
export declare const getAccessContext: (userId: string) => Promise<AccessContext>;
export declare const canRead: (scope: AccessScope, id: number) => boolean;
export declare const canCrud: (scope: AccessScope, id: number) => boolean;
export declare const getModuleAccessMap: (userId: string) => Promise<ModuleAccessMap>;
export declare const canReadModule: (moduleAccessMap: ModuleAccessMap, resourceKey: string) => boolean;
export declare const canCrudModule: (moduleAccessMap: ModuleAccessMap, resourceKey: string) => boolean;
export {};
//# sourceMappingURL=access-scope.d.ts.map