import { prismaEmployee, prismaFlowly } from "../application/database.js";
import { logger } from "../application/logging.js";
import { Validation } from "../validation/validation.js";
import { CaseDepartmentValidation } from "../validation/case-department-validation.js";
import { ResponseError } from "../error/response-error.js";
import { generateCaseDepartmentId } from "../utils/id-generator.js";
import { buildChanges, pickSnapshot, resolveActorType, writeAuditLog, } from "../utils/audit-log.js";
import { assertCaseCrud, assertCaseRead, getEmployeeChartSbuSubIds, resolveCaseAccess, isPicForSbuSub, } from "../utils/case-access.js";
import { CASE_DECISION_STATUSES, CASE_WORK_STATUSES, normalizeUpper, } from "../utils/case-constants.js";
import { toCaseDepartmentResponse, toCaseDepartmentListResponse, } from "../model/case-department-model.js";
import { CaseNotificationService } from "./case-notification-service.js";
const CASE_DEPARTMENT_FIELDS = [
    "caseId",
    "sbuSubId",
    "decisionStatus",
    "decisionAt",
    "decisionBy",
    "decisionNotes",
    "assigneeEmployeeId",
    "assignedAt",
    "assignedBy",
    "workStatus",
    "startDate",
    "targetDate",
    "endDate",
    "workNotes",
    "isActive",
    "isDeleted",
];
const getDepartmentSnapshot = (record) => pickSnapshot(record, CASE_DEPARTMENT_FIELDS);
const parseDate = (value) => {
    if (value === null)
        return null;
    if (value instanceof Date)
        return value;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        throw new ResponseError(400, "Invalid date format");
    }
    return parsed;
};
const normalizeNotes = (value) => {
    if (value === null)
        return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
};
const ensureDecisionStatus = (value) => {
    const normalized = normalizeUpper(value);
    if (!CASE_DECISION_STATUSES.includes(normalized)) {
        throw new ResponseError(400, "Invalid decisionStatus");
    }
    return normalized;
};
const ensureWorkStatus = (value) => {
    const normalized = normalizeUpper(value);
    if (!CASE_WORK_STATUSES.includes(normalized)) {
        throw new ResponseError(400, "Invalid workStatus");
    }
    return normalized;
};
const ensureSbuSubExists = async (sbuSubId) => {
    const sbuSub = await prismaEmployee.em_sbu_sub.findFirst({
        where: {
            id: sbuSubId,
            status: "A",
            OR: [{ isDeleted: false }, { isDeleted: null }],
        },
        select: { id: true },
    });
    if (!sbuSub) {
        throw new ResponseError(400, "Invalid SBU Sub");
    }
};
const ensureEmployeeInSbuSub = async (employeeId, sbuSubId) => {
    const employee = await prismaEmployee.em_employee.findUnique({
        where: { UserId: employeeId },
        select: { UserId: true, SbuSub: true },
    });
    if (!employee) {
        throw new ResponseError(404, "Employee not found");
    }
    // Temporary: allow assigning any employee regardless of SBU Sub.
    void sbuSubId;
};
const syncCaseHeaderStatus = async (caseId, requesterId) => {
    const [caseHeader, departments] = await Promise.all([
        prismaFlowly.caseHeader.findUnique({
            where: { caseId },
            select: { status: true, isDeleted: true },
        }),
        prismaFlowly.caseDepartment.findMany({
            where: { caseId, isDeleted: false },
            select: { decisionStatus: true, workStatus: true },
        }),
    ]);
    if (!caseHeader || caseHeader.isDeleted)
        return;
    if (departments.length === 0)
        return;
    const decisions = departments.map((dept) => dept.decisionStatus);
    const allRejected = decisions.every((value) => value === "REJECT");
    const anyPending = decisions.some((value) => value === "PENDING");
    const accepted = departments.filter((dept) => dept.decisionStatus === "ACCEPT");
    const anyAccepted = accepted.length > 0;
    const anyInProgress = departments.some((dept) => dept.workStatus === "IN_PROGRESS");
    const allAcceptedDone = accepted.length > 0 &&
        accepted.every((dept) => dept.workStatus === "DONE");
    let nextStatus = "NEW";
    if (allRejected) {
        nextStatus = "CANCEL";
    }
    else if (anyInProgress) {
        nextStatus = "IN_PROGRESS";
    }
    else if (allAcceptedDone) {
        nextStatus = "DONE";
    }
    else if (anyAccepted || anyPending) {
        nextStatus = "PENDING";
    }
    if (caseHeader.status === nextStatus)
        return;
    await prismaFlowly.caseHeader.update({
        where: { caseId },
        data: {
            status: nextStatus,
            updatedAt: new Date(),
            updatedBy: requesterId,
        },
    });
};
export class CaseDepartmentService {
    static async create(requesterId, reqBody) {
        const request = Validation.validate(CaseDepartmentValidation.CREATE, reqBody);
        const access = await resolveCaseAccess(requesterId);
        if (access.actorType === "FLOWLY") {
            assertCaseCrud(access);
        }
        const caseHeader = await prismaFlowly.caseHeader.findUnique({
            where: { caseId: request.caseId },
            select: { caseId: true, isDeleted: true, requesterEmployeeId: true },
        });
        if (!caseHeader || caseHeader.isDeleted) {
            throw new ResponseError(404, "Case not found");
        }
        if (access.actorType === "EMPLOYEE" && access.employeeId !== undefined) {
            const employeeId = access.employeeId;
            const isRequester = caseHeader.requesterEmployeeId === employeeId;
            if (!isRequester) {
                const departments = await prismaFlowly.caseDepartment.findMany({
                    where: { caseId: request.caseId, isDeleted: false },
                    select: { sbuSubId: true, assigneeEmployeeId: true },
                });
                const isAssignee = departments.some((dept) => dept.assigneeEmployeeId === employeeId);
                let isPic = false;
                if (!isAssignee && departments.length > 0) {
                    const sbuSubIds = Array.from(new Set(departments.map((dept) => dept.sbuSubId)));
                    const pic = await prismaEmployee.em_sbu_sub.findFirst({
                        where: {
                            id: { in: sbuSubIds },
                            pic: employeeId,
                            status: "A",
                            OR: [{ isDeleted: false }, { isDeleted: null }],
                        },
                        select: { id: true },
                    });
                    isPic = Boolean(pic);
                }
                if (!isAssignee && !isPic) {
                    throw new ResponseError(403, "Only requester, PIC, or assignee can add department");
                }
            }
        }
        await ensureSbuSubExists(request.sbuSubId);
        const existing = await prismaFlowly.caseDepartment.findFirst({
            where: { caseId: request.caseId, sbuSubId: request.sbuSubId },
            select: { caseDepartmentId: true },
        });
        if (existing) {
            throw new ResponseError(400, "Department already exists in case");
        }
        const createId = await generateCaseDepartmentId();
        const now = new Date();
        const created = await prismaFlowly.caseDepartment.create({
            data: {
                caseDepartmentId: createId(),
                caseId: request.caseId,
                sbuSubId: request.sbuSubId,
                decisionStatus: "PENDING",
                isActive: true,
                isDeleted: false,
                createdAt: now,
                updatedAt: now,
                createdBy: requesterId,
                updatedBy: requesterId,
            },
        });
        await writeAuditLog({
            module: "CASE",
            entity: "CASE_DEPARTMENT",
            entityId: created.caseDepartmentId,
            action: "CREATE",
            actorId: requesterId,
            actorType: access.actorType,
            snapshot: getDepartmentSnapshot(created),
            meta: { caseId: created.caseId },
        });
        await syncCaseHeaderStatus(created.caseId, requesterId);
        try {
            await CaseNotificationService.enqueueDepartmentAddedNotification({
                caseId: created.caseId,
                caseDepartmentId: created.caseDepartmentId,
                sbuSubId: created.sbuSubId,
                requesterId,
            });
        }
        catch (error) {
            logger.warn("Failed to enqueue case add-department notification", {
                caseDepartmentId: created.caseDepartmentId,
                error: error?.message ?? error,
            });
        }
        return toCaseDepartmentResponse(created);
    }
    static async update(requesterId, reqBody) {
        const request = Validation.validate(CaseDepartmentValidation.UPDATE, reqBody);
        const access = await resolveCaseAccess(requesterId);
        if (access.actorType === "FLOWLY") {
            assertCaseCrud(access);
        }
        const existing = await prismaFlowly.caseDepartment.findUnique({
            where: { caseDepartmentId: request.caseDepartmentId },
        });
        if (!existing || existing.isDeleted) {
            throw new ResponseError(404, "Case department not found");
        }
        if (access.actorType === "EMPLOYEE") {
            if (access.employeeId === undefined) {
                throw new ResponseError(401, "Unauthorized");
            }
            const employeeId = access.employeeId;
            const isPic = await isPicForSbuSub(employeeId, existing.sbuSubId);
            const isAssignee = existing.assigneeEmployeeId === employeeId;
            const hasDecisionUpdate = request.decisionStatus !== undefined || request.decisionNotes !== undefined;
            const hasAssignmentUpdate = request.assigneeEmployeeId !== undefined;
            const hasWorkUpdate = request.workStatus !== undefined ||
                request.startDate !== undefined ||
                request.targetDate !== undefined ||
                request.endDate !== undefined ||
                request.workNotes !== undefined;
            if (hasDecisionUpdate && !isPic) {
                throw new ResponseError(403, "Only PIC can update decision");
            }
            if (hasAssignmentUpdate && !isPic) {
                throw new ResponseError(403, "Only PIC can assign assignee");
            }
            if (hasWorkUpdate && !isPic && !isAssignee) {
                throw new ResponseError(403, "Only assignee or PIC can update work status");
            }
        }
        const nextDecisionStatus = request.decisionStatus !== undefined
            ? ensureDecisionStatus(request.decisionStatus)
            : existing.decisionStatus;
        const existingDecisionNotes = normalizeNotes(existing.decisionNotes ?? null);
        const nextDecisionNotes = request.decisionNotes !== undefined
            ? normalizeNotes(request.decisionNotes)
            : existingDecisionNotes;
        const shouldNotifyDecision = request.decisionStatus !== undefined &&
            nextDecisionStatus !== existing.decisionStatus &&
            (nextDecisionStatus === "ACCEPT" || nextDecisionStatus === "REJECT");
        const nextWorkStatus = request.workStatus !== undefined
            ? request.workStatus === null
                ? null
                : ensureWorkStatus(request.workStatus)
            : existing.workStatus;
        const hasAssignmentUpdate = request.assigneeEmployeeId !== undefined;
        const hasWorkUpdate = request.workStatus !== undefined ||
            request.startDate !== undefined ||
            request.targetDate !== undefined ||
            request.endDate !== undefined ||
            request.workNotes !== undefined;
        if ((hasAssignmentUpdate || hasWorkUpdate) && nextDecisionStatus !== "ACCEPT") {
            if (!(request.decisionStatus && nextDecisionStatus === "REJECT")) {
                throw new ResponseError(400, "Case must be accepted before assignment");
            }
        }
        if (nextDecisionStatus === "REJECT" && !nextDecisionNotes) {
            throw new ResponseError(400, "Komentar wajib diisi sebelum REJECT");
        }
        if (request.assigneeEmployeeId !== undefined && request.assigneeEmployeeId !== null) {
            await ensureEmployeeInSbuSub(request.assigneeEmployeeId, existing.sbuSubId);
        }
        const before = { ...existing };
        const now = new Date();
        const updateData = {
            workStatus: nextWorkStatus,
            startDate: request.startDate !== undefined
                ? parseDate(request.startDate)
                : existing.startDate,
            targetDate: request.targetDate !== undefined
                ? parseDate(request.targetDate)
                : existing.targetDate,
            endDate: request.endDate !== undefined
                ? parseDate(request.endDate)
                : existing.endDate,
            workNotes: request.workNotes !== undefined ? request.workNotes : existing.workNotes,
            isActive: request.isActive ?? existing.isActive,
            updatedAt: now,
            updatedBy: requesterId,
        };
        if (request.decisionStatus !== undefined || request.decisionNotes !== undefined) {
            if (request.decisionStatus !== undefined) {
                updateData.decisionStatus = nextDecisionStatus;
            }
            if (request.decisionNotes !== undefined) {
                updateData.decisionNotes = nextDecisionNotes;
            }
            updateData.decisionAt = now;
            updateData.decisionBy = requesterId;
        }
        if (request.assigneeEmployeeId !== undefined) {
            updateData.assigneeEmployeeId = request.assigneeEmployeeId;
            updateData.assignedAt = request.assigneeEmployeeId ? now : null;
            updateData.assignedBy = request.assigneeEmployeeId ? requesterId : null;
        }
        if (request.decisionStatus !== undefined && nextDecisionStatus === "REJECT") {
            updateData.assigneeEmployeeId = null;
            updateData.assignedAt = null;
            updateData.assignedBy = null;
            updateData.workStatus = null;
            updateData.startDate = null;
            updateData.targetDate = null;
            updateData.endDate = null;
            updateData.workNotes = null;
        }
        const updated = await prismaFlowly.caseDepartment.update({
            where: { caseDepartmentId: request.caseDepartmentId },
            data: updateData,
        });
        const changes = buildChanges(before, updated, CASE_DEPARTMENT_FIELDS);
        if (changes.length > 0) {
            await writeAuditLog({
                module: "CASE",
                entity: "CASE_DEPARTMENT",
                entityId: updated.caseDepartmentId,
                action: "UPDATE",
                actorId: requesterId,
                actorType: resolveActorType(requesterId),
                changes,
                meta: { caseId: updated.caseId },
            });
        }
        if (request.assigneeEmployeeId !== undefined &&
            request.assigneeEmployeeId !== null &&
            request.assigneeEmployeeId !== existing.assigneeEmployeeId) {
            try {
                await CaseNotificationService.enqueueAssigneeNotification({
                    caseId: updated.caseId,
                    caseDepartmentId: updated.caseDepartmentId,
                    sbuSubId: updated.sbuSubId,
                    assigneeEmployeeId: request.assigneeEmployeeId,
                    requesterId,
                });
            }
            catch (error) {
                logger.warn("Failed to enqueue case assignee notification", {
                    caseDepartmentId: updated.caseDepartmentId,
                    error: error?.message ?? error,
                });
            }
        }
        if (shouldNotifyDecision) {
            try {
                await CaseNotificationService.enqueueRequesterDecisionNotification({
                    caseId: updated.caseId,
                    caseDepartmentId: updated.caseDepartmentId,
                    requesterId,
                });
            }
            catch (error) {
                logger.warn("Failed to enqueue case decision notification", {
                    caseDepartmentId: updated.caseDepartmentId,
                    error: error?.message ?? error,
                });
            }
        }
        await syncCaseHeaderStatus(updated.caseId, requesterId);
        return toCaseDepartmentResponse(updated);
    }
    static async softDelete(requesterId, reqBody) {
        const request = Validation.validate(CaseDepartmentValidation.DELETE, reqBody);
        const access = await resolveCaseAccess(requesterId);
        if (access.actorType === "FLOWLY") {
            assertCaseCrud(access);
        }
        const existing = await prismaFlowly.caseDepartment.findUnique({
            where: { caseDepartmentId: request.caseDepartmentId },
        });
        if (!existing || existing.isDeleted) {
            throw new ResponseError(404, "Case department not found");
        }
        const now = new Date();
        const updated = await prismaFlowly.caseDepartment.update({
            where: { caseDepartmentId: request.caseDepartmentId },
            data: {
                isDeleted: true,
                isActive: false,
                deletedAt: now,
                deletedBy: requesterId,
                updatedAt: now,
                updatedBy: requesterId,
            },
        });
        await writeAuditLog({
            module: "CASE",
            entity: "CASE_DEPARTMENT",
            entityId: updated.caseDepartmentId,
            action: "DELETE",
            actorId: requesterId,
            actorType: resolveActorType(requesterId),
            snapshot: getDepartmentSnapshot(updated),
            meta: { caseId: updated.caseId },
        });
        await syncCaseHeaderStatus(updated.caseId, requesterId);
        return { message: "Case department deleted" };
    }
    static async list(requesterId, filters) {
        const access = await resolveCaseAccess(requesterId);
        if (access.actorType === "FLOWLY") {
            assertCaseRead(access);
        }
        const whereClause = {
            isDeleted: false,
            ...(access.actorType === "FLOWLY" && !access.canCrud ? { isActive: true } : {}),
            ...(filters?.caseId ? { caseId: filters.caseId } : {}),
            ...(filters?.sbuSubId !== undefined ? { sbuSubId: filters.sbuSubId } : {}),
            ...(filters?.decisionStatus ? { decisionStatus: filters.decisionStatus } : {}),
            ...(filters?.assigneeEmployeeId !== undefined
                ? { assigneeEmployeeId: filters.assigneeEmployeeId }
                : {}),
        };
        if (access.actorType === "EMPLOYEE" && access.employeeId !== undefined) {
            const employeeId = access.employeeId;
            const picSubs = await prismaEmployee.em_sbu_sub.findMany({
                where: {
                    pic: employeeId,
                    status: "A",
                    OR: [{ isDeleted: false }, { isDeleted: null }],
                },
                select: { id: true },
            });
            const picSbuSubIds = picSubs.map((sub) => sub.id);
            const chartSbuSubIds = await getEmployeeChartSbuSubIds(employeeId);
            const orFilters = [
                { assigneeEmployeeId: employeeId },
                { case: { requesterEmployeeId: employeeId } },
                ...(picSbuSubIds.length > 0
                    ? [{ sbuSubId: { in: picSbuSubIds } }]
                    : []),
            ];
            if (chartSbuSubIds.length > 0) {
                orFilters.push({
                    case: {
                        visibility: "PUBLIC",
                        OR: [
                            { originSbuSubId: { in: chartSbuSubIds } },
                            {
                                departments: {
                                    some: {
                                        sbuSubId: { in: chartSbuSubIds },
                                        isDeleted: false,
                                    },
                                },
                            },
                        ],
                    },
                });
            }
            whereClause.OR = orFilters;
        }
        const list = await prismaFlowly.caseDepartment.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
        });
        return list.map(toCaseDepartmentListResponse);
    }
}
//# sourceMappingURL=case-department-service.js.map