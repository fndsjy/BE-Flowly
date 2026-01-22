import type { AuditLogListResponse, ListAuditLogRequest } from "../model/audit-log-model.js";
export declare class AuditLogService {
    static list(requesterId: string, reqQuery: ListAuditLogRequest): Promise<AuditLogListResponse>;
}
//# sourceMappingURL=audit-log-service.d.ts.map