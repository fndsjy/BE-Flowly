import { prismaFlowly } from "../application/database.js";
import { logger } from "../application/logging.js";
export const resolveActorType = (actorId) => Number.isNaN(Number(actorId)) ? "FLOWLY" : "EMPLOYEE";
const MAX_STRING = 200;
const normalizeValue = (value) => {
    if (value instanceof Date)
        return value.toISOString();
    if (value === undefined)
        return null;
    if (typeof value === "string") {
        const trimmed = value.trim();
        if (trimmed.length > MAX_STRING) {
            return `${trimmed.slice(0, MAX_STRING)}...(${trimmed.length} chars)`;
        }
        return trimmed;
    }
    return value;
};
export const buildChanges = (before, after, fields) => {
    const changes = [];
    for (const field of fields) {
        const from = normalizeValue(before[field]);
        const to = normalizeValue(after[field]);
        if (JSON.stringify(from) !== JSON.stringify(to)) {
            changes.push({ field, from, to });
        }
    }
    return changes;
};
export const pickSnapshot = (record, fields) => {
    const snapshot = {};
    for (const field of fields) {
        snapshot[field] = normalizeValue(record[field]);
    }
    return snapshot;
};
export const writeAuditLog = async (entry) => {
    const payload = {
        ...entry,
        at: entry.at instanceof Date
            ? entry.at.toISOString()
            : entry.at ?? new Date().toISOString(),
    };
    const createdAt = entry.at instanceof Date
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
    }
    catch (error) {
        logger.warn("Audit log write failed", {
            error: error?.message ?? error,
        });
    }
};
//# sourceMappingURL=audit-log.js.map