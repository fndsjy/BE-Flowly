import { prismaFlowly } from "../application/database.js";
import { Validation } from "../validation/validation.js";
import { NotificationTemplateValidation } from "../validation/notification-template-validation.js";
import { ResponseError } from "../error/response-error.js";
import { generateNotificationTemplateId, generateNotificationTemplatePortalId, } from "../utils/id-generator.js";
import { getAccessContext } from "../utils/access-scope.js";
import { toNotificationTemplateListResponse, toNotificationTemplateResponse, } from "../model/notification-template-model.js";
const normalizeUpper = (value) => value.trim().toUpperCase();
const normalizePortalKeys = (values) => [...new Set((values ?? []).map((value) => normalizeUpper(value)).filter(Boolean))].sort();
const ensureAdminAccess = async (requesterId) => {
    const accessContext = await getAccessContext(requesterId);
    if (!accessContext.isAdmin) {
        throw new ResponseError(403, "Admin access required");
    }
};
const toPortalScopeKey = (portalKeys) => portalKeys.length === 0 ? "__ALL_PORTALS__" : portalKeys.join("|");
const matchesPortalScope = (item, portalKeys) => {
    const itemPortalKeys = normalizePortalKeys((item.portalMappings ?? [])
        .filter((mapping) => !mapping.isDeleted)
        .map((mapping) => mapping.portalKey));
    return toPortalScopeKey(itemPortalKeys) === toPortalScopeKey(portalKeys);
};
const prismaNotificationTemplate = () => prismaFlowly;
const notificationTemplateInclude = {
    portalMappings: {
        where: { isDeleted: false },
        orderBy: { portalKey: "asc" },
    },
};
export class NotificationTemplateService {
    static async create(requesterId, reqBody) {
        const request = Validation.validate(NotificationTemplateValidation.CREATE, reqBody);
        await ensureAdminAccess(requesterId);
        const client = prismaNotificationTemplate();
        const channel = normalizeUpper(request.channel);
        const eventKey = normalizeUpper(request.eventKey);
        const recipientRole = normalizeUpper(request.recipientRole);
        const portalKeys = normalizePortalKeys(request.portalKeys);
        const now = new Date();
        const candidates = await client.notificationTemplate.findMany({
            where: {
                isDeleted: false,
                channel,
                eventKey,
                recipientRole,
            },
            include: notificationTemplateInclude,
        });
        const conflict = candidates.find((item) => matchesPortalScope(item, portalKeys));
        if (conflict) {
            throw new ResponseError(409, "Template with the same channel, event, recipient role, and portal scope already exists");
        }
        const makeTemplateId = await generateNotificationTemplateId();
        const makePortalMappingId = await generateNotificationTemplatePortalId();
        const created = await client.$transaction(async (tx) => {
            const template = await tx.notificationTemplate.create({
                data: {
                    notificationTemplateId: makeTemplateId(),
                    templateName: request.templateName,
                    channel,
                    eventKey,
                    recipientRole,
                    messageTemplate: request.messageTemplate,
                    isActive: request.isActive ?? true,
                    isDeleted: false,
                    createdAt: now,
                    updatedAt: now,
                    createdBy: requesterId,
                    updatedBy: requesterId,
                },
            });
            for (const portalKey of portalKeys) {
                await tx.notificationTemplatePortal.create({
                    data: {
                        notificationTemplatePortalId: makePortalMappingId(),
                        notificationTemplateId: template.notificationTemplateId,
                        portalKey,
                        isActive: true,
                        isDeleted: false,
                        createdAt: now,
                        updatedAt: now,
                        createdBy: requesterId,
                        updatedBy: requesterId,
                    },
                });
            }
            return tx.notificationTemplate.findUnique({
                where: { notificationTemplateId: template.notificationTemplateId },
                include: notificationTemplateInclude,
            });
        });
        if (!created) {
            throw new ResponseError(500, "Failed to create notification template");
        }
        return toNotificationTemplateResponse(created);
    }
    static async update(requesterId, reqBody) {
        const request = Validation.validate(NotificationTemplateValidation.UPDATE, reqBody);
        await ensureAdminAccess(requesterId);
        const client = prismaNotificationTemplate();
        const existing = await client.notificationTemplate.findUnique({
            where: { notificationTemplateId: request.notificationTemplateId },
            include: notificationTemplateInclude,
        });
        if (!existing || existing.isDeleted) {
            throw new ResponseError(404, "Notification template not found");
        }
        const channel = request.channel !== undefined
            ? normalizeUpper(request.channel)
            : existing.channel;
        const eventKey = request.eventKey !== undefined
            ? normalizeUpper(request.eventKey)
            : existing.eventKey;
        const recipientRole = request.recipientRole !== undefined
            ? normalizeUpper(request.recipientRole)
            : existing.recipientRole;
        const portalKeys = request.portalKeys !== undefined
            ? normalizePortalKeys(request.portalKeys)
            : normalizePortalKeys((existing.portalMappings ?? []).map((mapping) => mapping.portalKey));
        const candidates = await client.notificationTemplate.findMany({
            where: {
                isDeleted: false,
                channel,
                eventKey,
                recipientRole,
                NOT: { notificationTemplateId: request.notificationTemplateId },
            },
            include: notificationTemplateInclude,
        });
        const conflict = candidates.find((item) => matchesPortalScope(item, portalKeys));
        if (conflict) {
            throw new ResponseError(409, "Template with the same channel, event, recipient role, and portal scope already exists");
        }
        const now = new Date();
        const makePortalMappingId = await generateNotificationTemplatePortalId();
        const updated = await client.$transaction(async (tx) => {
            await tx.notificationTemplate.update({
                where: { notificationTemplateId: request.notificationTemplateId },
                data: {
                    templateName: request.templateName ?? existing.templateName,
                    channel,
                    eventKey,
                    recipientRole,
                    messageTemplate: request.messageTemplate ?? existing.messageTemplate,
                    isActive: request.isActive ?? existing.isActive,
                    updatedAt: now,
                    updatedBy: requesterId,
                },
            });
            if (request.portalKeys !== undefined) {
                await tx.notificationTemplatePortal.updateMany({
                    where: {
                        notificationTemplateId: request.notificationTemplateId,
                        isDeleted: false,
                    },
                    data: {
                        isDeleted: true,
                        isActive: false,
                        deletedAt: now,
                        deletedBy: requesterId,
                        updatedAt: now,
                        updatedBy: requesterId,
                    },
                });
                for (const portalKey of portalKeys) {
                    await tx.notificationTemplatePortal.create({
                        data: {
                            notificationTemplatePortalId: makePortalMappingId(),
                            notificationTemplateId: request.notificationTemplateId,
                            portalKey,
                            isActive: true,
                            isDeleted: false,
                            createdAt: now,
                            updatedAt: now,
                            createdBy: requesterId,
                            updatedBy: requesterId,
                        },
                    });
                }
            }
            return tx.notificationTemplate.findUnique({
                where: { notificationTemplateId: request.notificationTemplateId },
                include: notificationTemplateInclude,
            });
        });
        if (!updated) {
            throw new ResponseError(500, "Failed to update notification template");
        }
        return toNotificationTemplateResponse(updated);
    }
    static async softDelete(requesterId, reqBody) {
        const request = Validation.validate(NotificationTemplateValidation.DELETE, reqBody);
        await ensureAdminAccess(requesterId);
        const client = prismaNotificationTemplate();
        const existing = await client.notificationTemplate.findUnique({
            where: { notificationTemplateId: request.notificationTemplateId },
            include: notificationTemplateInclude,
        });
        if (!existing || existing.isDeleted) {
            throw new ResponseError(404, "Notification template not found");
        }
        const now = new Date();
        const updated = await client.$transaction(async (tx) => {
            await tx.notificationTemplatePortal.updateMany({
                where: {
                    notificationTemplateId: request.notificationTemplateId,
                    isDeleted: false,
                },
                data: {
                    isDeleted: true,
                    isActive: false,
                    deletedAt: now,
                    deletedBy: requesterId,
                    updatedAt: now,
                    updatedBy: requesterId,
                },
            });
            await tx.notificationTemplate.update({
                where: { notificationTemplateId: request.notificationTemplateId },
                data: {
                    isDeleted: true,
                    isActive: false,
                    deletedAt: now,
                    deletedBy: requesterId,
                    updatedAt: now,
                    updatedBy: requesterId,
                },
            });
            return tx.notificationTemplate.findUnique({
                where: { notificationTemplateId: request.notificationTemplateId },
                include: notificationTemplateInclude,
            });
        });
        if (!updated) {
            throw new ResponseError(500, "Failed to delete notification template");
        }
        return toNotificationTemplateResponse(updated);
    }
    static async list(requesterId, filters) {
        await ensureAdminAccess(requesterId);
        const client = prismaNotificationTemplate();
        const items = await client.notificationTemplate.findMany({
            where: {
                isDeleted: false,
                ...(filters?.channel
                    ? { channel: normalizeUpper(filters.channel) }
                    : {}),
                ...(filters?.eventKey
                    ? { eventKey: normalizeUpper(filters.eventKey) }
                    : {}),
                ...(filters?.recipientRole
                    ? { recipientRole: normalizeUpper(filters.recipientRole) }
                    : {}),
                ...(filters?.isActive !== undefined ? { isActive: filters.isActive } : {}),
                ...(filters?.portalKey
                    ? {
                        portalMappings: {
                            some: {
                                portalKey: normalizeUpper(filters.portalKey),
                                isDeleted: false,
                            },
                        },
                    }
                    : {}),
            },
            include: notificationTemplateInclude,
            orderBy: { updatedAt: "desc" },
        });
        return items.map(toNotificationTemplateListResponse);
    }
}
//# sourceMappingURL=notification-template-service.js.map