export type AuditLogResponse = {
  logId: number;
  module: string;
  moduleLabel: string | null;
  entity: string;
  entityLabel: string | null;
  entityId: string;
  action: string;
  actorId: string | null;
  actorType: string | null;
  changes: Record<string, unknown>[] | null;
  snapshot: Record<string, unknown> | null;
  meta: Record<string, unknown> | null;
  createdAt: Date;
};

export type AuditLogListResponse = {
  data: AuditLogResponse[];
  page: number;
  pageSize: number;
  total: number;
};

export type ListAuditLogRequest = {
  module?: string;
  entity?: string;
  entityId?: string;
  action?: string;
  actorId?: string;
  actorType?: string;
  dateFrom?: Date;
  dateTo?: Date;
  q?: string;
  page?: number;
  pageSize?: number;
  includeMaster?: boolean;
};
