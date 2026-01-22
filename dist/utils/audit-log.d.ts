export type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "AUTO_DEACTIVATE";
export type AuditChange = {
    field: string;
    from: unknown;
    to: unknown;
};
export type AuditEntry = {
    module: string;
    entity: string;
    entityId: string;
    action: AuditAction;
    actorId: string;
    actorType?: string | null;
    at: string;
    changes?: AuditChange[];
    snapshot?: Record<string, unknown>;
    meta?: Record<string, unknown>;
};
export declare const resolveActorType: (actorId: string) => "EMPLOYEE" | "FLOWLY";
export declare const buildChanges: (before: Record<string, unknown>, after: Record<string, unknown>, fields: string[]) => AuditChange[];
export declare const pickSnapshot: (record: Record<string, unknown>, fields: string[]) => Record<string, unknown>;
export declare const writeAuditLog: (entry: Omit<AuditEntry, "at"> & {
    at?: Date | string;
}) => Promise<void>;
//# sourceMappingURL=audit-log.d.ts.map