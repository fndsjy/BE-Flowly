import { prismaFlowly } from "../application/database.js";
import { Validation } from "../validation/validation.js";
import { AuditLogValidation } from "../validation/audit-log-validation.js";
import { ResponseError } from "../error/response-error.js";
import { getAccessContext, getModuleAccessMap, canReadModule } from "../utils/access-scope.js";
const parseJson = (value) => {
    if (!value)
        return null;
    try {
        return JSON.parse(value);
    }
    catch {
        return null;
    }
};
export class AuditLogService {
    static async list(requesterId, reqQuery) {
        const request = Validation.validate(AuditLogValidation.LIST, reqQuery);
        const accessContext = await getAccessContext(requesterId);
        const moduleAccessMap = await getModuleAccessMap(requesterId);
        if (!accessContext.isAdmin && !canReadModule(moduleAccessMap, "ADMIN_AUDIT_LOG")) {
            throw new ResponseError(403, "Module ADMIN_AUDIT_LOG access required");
        }
        const page = request.page ?? 1;
        const pageSize = request.pageSize ?? 50;
        const skip = (page - 1) * pageSize;
        const whereClause = {};
        if (request.module)
            whereClause.module = request.module;
        if (request.entity)
            whereClause.entity = request.entity;
        if (request.entityId)
            whereClause.entityId = request.entityId;
        if (request.action)
            whereClause.action = request.action;
        if (request.actorId)
            whereClause.actorId = request.actorId;
        if (request.actorType)
            whereClause.actorType = request.actorType;
        if (request.dateFrom || request.dateTo) {
            whereClause.createdAt = {};
            if (request.dateFrom)
                whereClause.createdAt.gte = request.dateFrom;
            if (request.dateTo)
                whereClause.createdAt.lte = request.dateTo;
        }
        if (request.q) {
            whereClause.OR = [
                { module: { contains: request.q } },
                { entity: { contains: request.q } },
                { entityId: { contains: request.q } },
                { action: { contains: request.q } },
                { actorId: { contains: request.q } },
                { changes: { contains: request.q } },
                { snapshot: { contains: request.q } },
                { meta: { contains: request.q } },
            ];
        }
        const [total, rows] = await prismaFlowly.$transaction([
            prismaFlowly.auditLog.count({ where: whereClause }),
            prismaFlowly.auditLog.findMany({
                where: whereClause,
                orderBy: { createdAt: "desc" },
                skip,
                take: pageSize,
            }),
        ]);
        const masterEntries = request.includeMaster
            ? await prismaFlowly.masterAccessRole.findMany({
                where: {
                    isDeleted: false,
                    isActive: true,
                    resourceType: { in: ["AUDIT_MODULE", "AUDIT_ENTITY"] }
                },
                select: {
                    resourceType: true,
                    resourceKey: true,
                    displayName: true,
                }
            })
            : [];
        const moduleLabelMap = new Map();
        const entityLabelMap = new Map();
        if (request.includeMaster) {
            for (const entry of masterEntries) {
                if (entry.resourceType === "AUDIT_MODULE") {
                    moduleLabelMap.set(entry.resourceKey, entry.displayName);
                }
                if (entry.resourceType === "AUDIT_ENTITY") {
                    entityLabelMap.set(entry.resourceKey, entry.displayName);
                }
            }
        }
        const data = rows.map((row) => ({
            logId: row.logId,
            module: row.module,
            moduleLabel: moduleLabelMap.get(row.module) ?? null,
            entity: row.entity,
            entityLabel: entityLabelMap.get(row.entity) ?? null,
            entityId: row.entityId,
            action: row.action,
            actorId: row.actorId ?? null,
            actorType: row.actorType ?? null,
            changes: parseJson(row.changes),
            snapshot: parseJson(row.snapshot),
            meta: parseJson(row.meta),
            createdAt: row.createdAt,
        }));
        return { data, page, pageSize, total };
    }
}
//# sourceMappingURL=audit-log-service.js.map