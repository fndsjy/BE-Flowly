import { prismaEmployee, prismaFlowly } from "../application/database.js";
import { Validation } from "../validation/validation.js";
import { CaseFeedbackCommentValidation } from "../validation/case-feedback-comment-validation.js";
import { ResponseError } from "../error/response-error.js";
import { generateCaseFeedbackCommentId } from "../utils/id-generator.js";
import { logger } from "../application/logging.js";
import { CaseNotificationService } from "./case-notification-service.js";
import { assertCaseRead, ensureCaseNotClosed, getEmployeeChartSbuSubIds, resolveCaseAccess, } from "../utils/case-access.js";
import { toCaseFeedbackCommentListResponse, toCaseFeedbackCommentResponse, } from "../model/case-feedback-comment-model.js";
const FEEDBACK_ALLOWED_CASE_TYPES = new Set(["PROBLEM", "PROJECT"]);
const ensureCaseFeedbackAccess = async (caseId, employeeId) => {
    const caseHeader = (await prismaFlowly.caseHeader.findUnique({
        where: { caseId },
        select: {
            caseId: true,
            caseType: true,
            requesterId: true,
            requesterEmployeeId: true,
            visibility: true,
            originSbuSubId: true,
            isDeleted: true,
        },
    }));
    if (!caseHeader || caseHeader.isDeleted) {
        throw new ResponseError(404, "Case not found");
    }
    if (!FEEDBACK_ALLOWED_CASE_TYPES.has(caseHeader.caseType)) {
        throw new ResponseError(400, "Feedback only available for PROBLEM/PROJECT case");
    }
    if (employeeId === undefined) {
        return caseHeader;
    }
    if (caseHeader.requesterEmployeeId === employeeId) {
        return caseHeader;
    }
    const assigned = await prismaFlowly.caseDepartment.findFirst({
        where: {
            caseId,
            assigneeEmployeeId: employeeId,
            isDeleted: false,
        },
        select: { caseDepartmentId: true },
    });
    if (assigned) {
        return caseHeader;
    }
    const picSubs = await prismaEmployee.em_sbu_sub.findMany({
        where: {
            pic: employeeId,
            status: "A",
            OR: [{ isDeleted: false }, { isDeleted: null }],
        },
        select: { id: true },
    });
    const picIds = picSubs.map((item) => item.id);
    if (picIds.length > 0) {
        if (caseHeader.originSbuSubId && picIds.includes(caseHeader.originSbuSubId)) {
            return caseHeader;
        }
        const hasDept = await prismaFlowly.caseDepartment.findFirst({
            where: {
                caseId,
                sbuSubId: { in: picIds },
                isDeleted: false,
            },
            select: { caseDepartmentId: true },
        });
        if (hasDept) {
            return caseHeader;
        }
    }
    if ((caseHeader.visibility ?? "PRIVATE") === "PUBLIC") {
        const chartSbuSubIds = await getEmployeeChartSbuSubIds(employeeId);
        if (chartSbuSubIds.length > 0) {
            if (caseHeader.originSbuSubId &&
                chartSbuSubIds.includes(caseHeader.originSbuSubId)) {
                return caseHeader;
            }
            const chartDept = await prismaFlowly.caseDepartment.findFirst({
                where: {
                    caseId,
                    sbuSubId: { in: chartSbuSubIds },
                    isDeleted: false,
                },
                select: { caseDepartmentId: true },
            });
            if (chartDept) {
                return caseHeader;
            }
        }
    }
    throw new ResponseError(403, "No access to case feedback");
};
const resolveCommenterName = async (requesterId, access) => {
    if (access.actorType === "EMPLOYEE" && access.employeeId !== undefined) {
        const employee = await prismaEmployee.em_employee.findUnique({
            where: { UserId: access.employeeId },
            select: { Name: true },
        });
        const name = employee?.Name?.trim();
        if (name)
            return name;
    }
    if (access.actorType === "FLOWLY") {
        const user = await prismaFlowly.user.findUnique({
            where: { userId: requesterId, isDeleted: false },
            select: { name: true },
        });
        const name = user?.name?.trim();
        if (name)
            return name;
    }
    return requesterId;
};
const resolveCommenterEmployeeId = async (requesterId, access) => {
    if (access.actorType === "EMPLOYEE" && access.employeeId !== undefined) {
        return access.employeeId;
    }
    if (access.actorType !== "FLOWLY") {
        return null;
    }
    const numericId = Number(requesterId);
    if (!Number.isNaN(numericId)) {
        const employee = await prismaEmployee.em_employee.findUnique({
            where: { UserId: numericId },
            select: { UserId: true },
        });
        if (employee?.UserId)
            return employee.UserId;
    }
    const flowlyUser = await prismaFlowly.user.findUnique({
        where: { userId: requesterId, isDeleted: false },
        select: { badgeNumber: true },
    });
    const badgeNumber = flowlyUser?.badgeNumber?.trim();
    if (!badgeNumber)
        return null;
    const employee = await prismaEmployee.em_employee.findFirst({
        where: { BadgeNum: badgeNumber },
        select: { UserId: true },
    });
    return employee?.UserId ?? null;
};
export class CaseFeedbackCommentService {
    static async create(requesterId, reqBody) {
        const request = Validation.validate(CaseFeedbackCommentValidation.CREATE, reqBody);
        const access = await resolveCaseAccess(requesterId);
        assertCaseRead(access);
        const caseHeader = access.actorType === "EMPLOYEE" && access.employeeId !== undefined
            ? await ensureCaseFeedbackAccess(request.caseId, access.employeeId)
            : await ensureCaseFeedbackAccess(request.caseId);
        await ensureCaseNotClosed(request.caseId);
        const createId = await generateCaseFeedbackCommentId();
        const now = new Date();
        const commenterName = await resolveCommenterName(requesterId, access);
        const commenterEmployeeId = await resolveCommenterEmployeeId(requesterId, access);
        const commentText = request.commentText.trim();
        if (!commentText) {
            throw new ResponseError(400, "Komentar wajib diisi");
        }
        const commentId = createId();
        const commenterType = access.actorType;
        const commenterId = access.actorType === "FLOWLY" ? requesterId : null;
        const created = await prismaFlowly.caseFeedbackComment.create({
            data: {
                caseFeedbackCommentId: commentId,
                caseId: request.caseId,
                commentText,
                commenterName,
                commenterType,
                commenterId,
                commenterEmployeeId,
                isActive: true,
                createdAt: now,
                createdBy: requesterId,
                updatedBy: requesterId,
                isDeleted: false,
            },
            select: {
                caseFeedbackCommentId: true,
                caseId: true,
                commentText: true,
                commenterName: true,
                commenterType: true,
                commenterId: true,
                commenterEmployeeId: true,
                isActive: true,
                isDeleted: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        try {
            await CaseNotificationService.enqueueFeedbackCommentNotifications({
                caseId: request.caseId,
                requesterId,
                commenterEmployeeId,
                commenterName,
                commentText,
            });
        }
        catch (error) {
            logger.warn("Failed to enqueue feedback comment notifications", {
                caseId: request.caseId,
                error: error?.message ?? error,
            });
        }
        return toCaseFeedbackCommentResponse(created);
    }
    static async list(requesterId, filters) {
        const access = await resolveCaseAccess(requesterId);
        assertCaseRead(access);
        if (access.actorType === "EMPLOYEE" && access.employeeId !== undefined) {
            if (!filters?.caseId) {
                return [];
            }
            await ensureCaseFeedbackAccess(filters.caseId, access.employeeId);
        }
        let list = [];
        list = await prismaFlowly.caseFeedbackComment.findMany({
            where: {
                isDeleted: false,
                ...(filters?.caseId ? { caseId: filters.caseId } : {}),
            },
            orderBy: { createdAt: "asc" },
            select: {
                caseFeedbackCommentId: true,
                caseId: true,
                commentText: true,
                commenterName: true,
                commenterType: true,
                commenterId: true,
                commenterEmployeeId: true,
                isActive: true,
                isDeleted: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        const listItems = list;
        return listItems.map(toCaseFeedbackCommentListResponse);
    }
}
//# sourceMappingURL=case-feedback-comment-service.js.map