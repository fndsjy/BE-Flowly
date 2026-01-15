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
export declare const getAccessContext: (userId: string) => Promise<AccessContext>;
export declare const canRead: (scope: AccessScope, id: number) => boolean;
export declare const canCrud: (scope: AccessScope, id: number) => boolean;
//# sourceMappingURL=access-scope.d.ts.map