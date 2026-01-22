import { prismaFlowly } from "../application/database.js";
import { logger } from "../application/logging.js";

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

export const resolveActorType = (actorId: string) =>
  Number.isNaN(Number(actorId)) ? "FLOWLY" : "EMPLOYEE";

const MAX_STRING = 200;

const normalizeValue = (value: unknown) => {
  if (value instanceof Date) return value.toISOString();
  if (value === undefined) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length > MAX_STRING) {
      return `${trimmed.slice(0, MAX_STRING)}...(${trimmed.length} chars)`;
    }
    return trimmed;
  }
  return value;
};

export const buildChanges = (
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  fields: string[]
) => {
  const changes: AuditChange[] = [];
  for (const field of fields) {
    const from = normalizeValue(before[field]);
    const to = normalizeValue(after[field]);
    if (JSON.stringify(from) !== JSON.stringify(to)) {
      changes.push({ field, from, to });
    }
  }
  return changes;
};

export const pickSnapshot = (
  record: Record<string, unknown>,
  fields: string[]
) => {
  const snapshot: Record<string, unknown> = {};
  for (const field of fields) {
    snapshot[field] = normalizeValue(record[field]);
  }
  return snapshot;
};

export const writeAuditLog = async (
  entry: Omit<AuditEntry, "at"> & { at?: Date | string }
) => {
  const payload: AuditEntry = {
    ...entry,
    at:
      entry.at instanceof Date
        ? entry.at.toISOString()
        : entry.at ?? new Date().toISOString(),
  };

  const createdAt =
    entry.at instanceof Date
      ? entry.at
      : entry.at
        ? new Date(entry.at)
        : new Date();

  try {
    await prismaFlowly.auditLog.create({
      data: {
        module: payload.module,
        entity: payload.entity,
        entityId: payload.entityId,
        action: payload.action,
        actorId: payload.actorId,
        actorType: payload.actorType ?? null,
        changes: payload.changes ? JSON.stringify(payload.changes) : null,
        snapshot: payload.snapshot ? JSON.stringify(payload.snapshot) : null,
        meta: payload.meta ? JSON.stringify(payload.meta) : null,
        createdAt,
      },
    });
  } catch (error) {
    logger.warn("Audit log write failed", {
      error: (error as Error)?.message ?? error,
    });
  }
};
