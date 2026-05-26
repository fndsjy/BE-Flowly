type AccessResource = {
    resourceType: string;
    resourceKey: string;
};
export declare const hasConfiguredAccess: (requesterId: string, resources: AccessResource[]) => Promise<boolean>;
export declare const hasEmployeeAdminAccess: (requesterId: string) => Promise<boolean>;
export declare const ensureEmployeeAdminAccess: (requesterId: string, message?: string) => Promise<void>;
export {};
//# sourceMappingURL=admin-access.d.ts.map