import { prismaFlowly } from "../application/database.js";
import { Validation } from "../validation/validation.js";
import { CaseNotificationMessageValidation } from "../validation/case-notification-message-validation.js";
import { ResponseError } from "../error/response-error.js";
import { generateCaseNotificationMessageId } from "../utils/id-generator.js";
import { getAccessContext } from "../utils/access-scope.js";
import { toCaseNotificationMessageResponse, toCaseNotificationMessageListResponse, } from "../model/case-notification-message-model.js";
const normalizeRole = (value) => value.trim().toUpperCase();
const ensureAdminAccess = async (requesterId) => {
    const accessContext = await getAccessContext(requesterId);
    if (!accessContext.isAdmin) {
        throw new ResponseError(403, "Admin access required");
    }
};
const ensureCaseExists = async (caseId) => {
    const caseHeader = await prismaFlowly.caseHeader.findUnique({
        where: { caseId },
        select: { caseId: true, isDeleted: true },
    });
    if (!caseHeader || caseHeader.isDeleted) {
        throw new ResponseError(404, "Case not found");
    }
};
const ensureCaseDepartment = async (caseDepartmentId, caseId) => {
    const department = await prismaFlowly.caseDepartment.findUnique({
        where: { caseDepartmentId },
        select: { caseId: true, isDeleted: true },
    });
    if (!department || department.isDeleted) {
        throw new ResponseError(404, "Case department not found");
    }
    if (department.caseId !== caseId) {
        throw new ResponseError(400, "Case department does not belong to case");
    }
};
export class CaseNotificationMessageService {
    static async create(requesterId, reqBody) {
        const request = Validation.validate(CaseNotificationMessageValidation.CREATE, reqBody);
        await ensureAdminAccess(requesterId);
        await ensureCaseExists(request.caseId);
        if (request.caseDepartmentId) {
            await ensureCaseDepartment(request.caseDepartmentId, request.caseId);
        }
        const role = normalizeRole(request.role);
        const now = new Date();
        const existing = await prismaFlowly.caseNotificationMessage.findFirst({
            where: {
                isDeleted: false,
                caseId: request.caseId,
                caseDepartmentId: request.caseDepartmentId ?? null,
                recipientEmployeeId: request.recipientEmployeeId,
                role,
            },
            select: { caseNotificationMessageId: true },
        });
        if (existing) {
            const updated = await prismaFlowly.caseNotificationMessage.update({
                where: { caseNotificationMessageId: existing.caseNotificationMessageId },
                data: {
                    messageTemplate: request.messageTemplate,
                    isActive: request.isActive ?? true,
                    updatedAt: now,
                    updatedBy: requesterId,
                },
            });
            return toCaseNotificationMessageResponse(updated);
        }
        const createId = await generateCaseNotificationMessageId();
        const created = await prismaFlowly.caseNotificationMessage.create({
            data: {
                caseNotificationMessageId: createId(),
                caseId: request.caseId,
                caseDepartmentId: request.caseDepartmentId ?? null,
                recipientEmployeeId: request.recipientEmployeeId,
                role,
                messageTemplate: request.messageTemplate,
                isActive: request.isActive ?? true,
                isDeleted: false,
                createdAt: now,
                updatedAt: now,
                createdBy: requesterId,
                updatedBy: requesterId,
            },
        });
        return toCaseNotificationMessageResponse(created);
    }
    static async update(requesterId, reqBody) {
        const request = Validation.validate(CaseNotificationMessageValidation.UPDATE, reqBody);
        await ensureAdminAccess(requesterId);
        const existing = await prismaFlowly.caseNotificationMessage.findUnique({
            where: { caseNotificationMessageId: request.caseNotificationMessageId },
        });
        if (!existing || existing.isDeleted) {
            throw new ResponseError(404, "Notification message not found");
        }
        if (!existing.caseId) {
            throw new ResponseError(400, "Case ID is required");
        }
        const updated = await prismaFlowly.caseNotificationMessage.update({
            where: { caseNotificationMessageId: request.caseNotificationMessageId },
            data: {
                messageTemplate: request.messageTemplate ?? existing.messageTemplate,
                isActive: request.isActive ?? existing.isActive,
                updatedAt: new Date(),
                updatedBy: requesterId,
            },
        });
        return toCaseNotificationMessageResponse(updated);
    }
    static async softDelete(requesterId, reqBody) {
        const request = Validation.validate(CaseNotificationMessageValidation.DELETE, reqBody);
        await ensureAdminAccess(requesterId);
        const existing = await prismaFlowly.caseNotificationMessage.findUnique({
            where: { caseNotificationMessageId: request.caseNotificationMessageId },
        });
        if (!existing || existing.isDeleted) {
            throw new ResponseError(404, "Notification message not found");
        }
        if (!existing.caseId) {
            throw new ResponseError(400, "Case ID is required");
        }
        const now = new Date();
        const updated = await prismaFlowly.caseNotificationMessage.update({
            where: { caseNotificationMessageId: request.caseNotificationMessageId },
            data: {
                isDeleted: true,
                isActive: false,
                deletedAt: now,
                deletedBy: requesterId,
                updatedAt: now,
                updatedBy: requesterId,
            },
        });
        return toCaseNotificationMessageResponse(updated);
    }
    static async list(requesterId, filters) {
        await ensureAdminAccess(requesterId);
        if (filters?.caseId) {
            await ensureCaseExists(filters.caseId);
        }
        const where = {
            isDeleted: false,
            ...(filters?.caseId ? { caseId: filters.caseId } : {}),
            ...(filters?.caseDepartmentId
                ? { caseDepartmentId: filters.caseDepartmentId }
                : {}),
            ...(filters?.recipientEmployeeId !== undefined
                ? { recipientEmployeeId: filters.recipientEmployeeId }
                : {}),
            ...(filters?.role ? { role: normalizeRole(filters.role) } : {}),
        };
        const items = await prismaFlowly.caseNotificationMessage.findMany({
            where,
            orderBy: { updatedAt: "desc" },
        });
        return items.map(toCaseNotificationMessageListResponse);
    }
}
//# sourceMappingURL=case-notification-message-service.js.map