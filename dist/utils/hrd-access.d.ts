export type HrdAccessLevel = "READ" | "CRUD";
export declare const resolveHrdAccessLevel: (requesterUserId: string) => Promise<HrdAccessLevel>;
export declare const ensureHrdReadAccess: (requesterUserId: string) => Promise<void>;
export declare const ensureHrdCrudAccess: (requesterUserId: string) => Promise<void>;
//# sourceMappingURL=hrd-access.d.ts.map