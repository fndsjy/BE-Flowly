import { prismaFlowly } from "../application/database.js";
import { Validation } from "../validation/validation.js";
import { CaseNotificationTemplateValidation } from "../validation/case-notification-template-validation.js";
import { ResponseError } from "../error/response-error.js";
import { generateCaseNotificationTemplateId } from "../utils/id-generator.js";
import { getAccessContext } from "../utils/access-scope.js";
import { toCaseNotificationTemplateResponse, toCaseNotificationTemplateListResponse, } from "../model/case-notification-template-model.js";
const normalizeRole = (value) => value.trim().toUpperCase();
const normalizeChannel = (value) => value.trim().toUpperCase();
const normalizeAction = (value) => {
    if (value === undefined || value === null)
        return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed.toUpperCase() : null;
};
const normalizeCaseType = (value) => {
    if (value === undefined || value === null)
        return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed.toUpperCase() : null;
};
const ensureAdminAccess = async (requesterId) => {
    const accessContext = await getAccessContext(requesterId);
    if (!accessContext.isAdmin) {
        throw new ResponseError(403, "Admin access required");
    }
};
export class CaseNotificationTemplateService {
    static async create(requesterId, reqBody) {
        const request = Validation.validate(CaseNotificationTemplateValidation.CREATE, reqBody);
        await ensureAdminAccess(requesterId);
        const role = normalizeRole(request.role);
        const channel = normalizeChannel(request.channel);
        const action = normalizeAction(request.action);
        const caseType = normalizeCaseType(request.caseType);
        const now = new Date();
        const client = prismaFlowly;
        const existing = await client.caseNotificationTemplate.findFirst({
            where: {
                isDeleted: false,
                role,
                channel,
                action,
                caseType,
            },
            select: { caseNotificationTemplateId: true },
        });
        if (existing) {
            const updated = await client.caseNotificationTemplate.update({
                where: { caseNotificationTemplateId: existing.caseNotificationTemplateId },
                data: {
                    templateName: request.templateName,
                    messageTemplate: request.messageTemplate,
                    isActive: request.isActive ?? true,
                    updatedAt: now,
                    updatedBy: requesterId,
                },
            });
            return toCaseNotificationTemplateResponse(updated);
        }
        const createId = await generateCaseNotificationTemplateId();
        const created = await client.caseNotificationTemplate.create({
            data: {
                caseNotificationTemplateId: createId(),
                templateName: request.templateName,
                channel,
                role,
                action,
                caseType,
                messageTemplate: request.messageTemplate,
                isActive: request.isActive ?? true,
                isDeleted: false,
                createdAt: now,
                updatedAt: now,
                createdBy: requesterId,
                updatedBy: requesterId,
            },
        });
        return toCaseNotificationTemplateResponse(created);
    }
    static async update(requesterId, reqBody) {
        const request = Validation.validate(CaseNotificationTemplateValidation.UPDATE, reqBody);
        await ensureAdminAccess(requesterId);
        const client = prismaFlowly;
        const existing = await client.caseNotificationTemplate.findUnique({
            where: { caseNotificationTemplateId: request.caseNotificationTemplateId },
        });
        if (!existing || existing.isDeleted) {
            throw new ResponseError(404, "Notification template not found");
        }
        const nextChannel = request.channel
            ? normalizeChannel(request.channel)
            : existing.channel;
        const nextRole = request.role ? normalizeRole(request.role) : existing.role;
        const nextAction = request.action === undefined
            ? existing.action
            : normalizeAction(request.action);
        const nextCaseType = request.caseType === undefined
            ? existing.caseType
            : normalizeCaseType(request.caseType);
        const conflict = await client.caseNotificationTemplate.findFirst({
            where: {
                isDeleted: false,
                channel: nextChannel,
                role: nextRole,
                action: nextAction,
                caseType: nextCaseType,
                NOT: { caseNotificationTemplateId: request.caseNotificationTemplateId },
            },
            select: { caseNotificationTemplateId: true },
        });
        if (conflict) {
            throw new ResponseError(409, "Template with the same channel, role, action, and case type already exists");
        }
        const updated = await client.caseNotificationTemplate.update({
            where: { caseNotificationTemplateId: request.caseNotificationTemplateId },
            data: {
                templateName: request.templateName ?? existing.templateName,
                channel: nextChannel,
                role: nextRole,
                action: nextAction,
                caseType: nextCaseType,
                messageTemplate: request.messageTemplate ?? existing.messageTemplate,
                isActive: request.isActive ?? existing.isActive,
                updatedAt: new Date(),
                updatedBy: requesterId,
            },
        });
        return toCaseNotificationTemplateResponse(updated);
    }
    static async softDelete(requesterId, reqBody) {
        const request = Validation.validate(CaseNotificationTemplateValidation.DELETE, reqBody);
        await ensureAdminAccess(requesterId);
        const client = prismaFlowly;
        const existing = await client.caseNotificationTemplate.findUnique({
            where: { caseNotificationTemplateId: request.caseNotificationTemplateId },
        });
        if (!existing || existing.isDeleted) {
            throw new ResponseError(404, "Notification template not found");
        }
        const now = new Date();
        const updated = await client.caseNotificationTemplate.update({
            where: { caseNotificationTemplateId: request.caseNotificationTemplateId },
            data: {
                isDeleted: true,
                isActive: false,
                deletedAt: now,
                deletedBy: requesterId,
                updatedAt: now,
                updatedBy: requesterId,
            },
        });
        return toCaseNotificationTemplateResponse(updated);
    }
    static async list(requesterId, filters) {
        await ensureAdminAccess(requesterId);
        const where = {
            isDeleted: false,
            ...(filters?.channel
                ? { channel: normalizeChannel(filters.channel) }
                : {}),
            ...(filters?.role ? { role: normalizeRole(filters.role) } : {}),
            ...(filters?.action !== undefined
                ? { action: normalizeAction(filters.action) }
                : {}),
            ...(filters?.caseType !== undefined
                ? { caseType: normalizeCaseType(filters.caseType) }
                : {}),
            ...(filters?.isActive !== undefined ? { isActive: filters.isActive } : {}),
        };
        const items = await prismaFlowly.caseNotificationTemplate.findMany({
            where,
            orderBy: { updatedAt: "desc" },
        });
        return items.map(toCaseNotificationTemplateListResponse);
    }
}
//# sourceMappingURL=case-notification-template-service.js.map