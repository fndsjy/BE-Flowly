import { prismaEmployee, prismaFlowly } from "../application/database.js";
import { logger } from "../application/logging.js";
import { Validation } from "../validation/validation.js";
import { CaseHeaderValidation } from "../validation/case-header-validation.js";
import { ResponseError } from "../error/response-error.js";
import { generateCaseId, generateCaseDepartmentId, } from "../utils/id-generator.js";
import { buildChanges, pickSnapshot, resolveActorType, writeAuditLog, } from "../utils/audit-log.js";
import { assertCaseCrud, assertCaseRead, getEmployeeChartSbuSubIds, resolveCaseAccess, } from "../utils/case-access.js";
import { CASE_STATUSES, CASE_TYPES, CASE_VISIBILITIES, normalizeUpper, } from "../utils/case-constants.js";
import { Prisma } from "../generated/flowly/client.js";
import { toCaseHeaderResponse, toCaseHeaderListResponse, } from "../model/case-header-model.js";
import { CaseNotificationService } from "./case-notification-service.js";
const CASE_AUDIT_FIELDS = [
    "caseType",
    "caseTitle",
    "background",
    "currentCondition",
    "projectDesc",
    "projectObjective",
    "locationDesc",
    "notes",
    "status",
    "visibility",
    "requesterId",
    "requesterEmployeeId",
    "originSbuSubId",
    "isActive",
    "isDeleted",
];
const getCaseSnapshot = (record) => pickSnapshot(record, CASE_AUDIT_FIELDS);
const normalizeNullableText = (value) => {
    if (value === undefined)
        return undefined;
    if (value === null)
        return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
};
const ensureCaseType = (value) => {
    const normalized = normalizeUpper(value);
    if (!CASE_TYPES.includes(normalized)) {
        throw new ResponseError(400, "Invalid caseType");
    }
    return normalized;
};
const ensureCaseStatus = (value) => {
    const normalized = normalizeUpper(value);
    if (!CASE_STATUSES.includes(normalized)) {
        throw new ResponseError(400, "Invalid status");
    }
    return normalized;
};
const ensureCaseVisibility = (value) => {
    const normalized = normalizeUpper(value);
    if (!CASE_VISIBILITIES.includes(normalized)) {
        throw new ResponseError(400, "Invalid visibility");
    }
    return normalized;
};
const ensureCaseRequirements = (payload) => {
    if (payload.caseType === "PROBLEM") {
        if (!payload.background || !payload.currentCondition) {
            throw new ResponseError(400, "background and currentCondition are required for PROBLEM");
        }
    }
    if (payload.caseType === "PROJECT") {
        if (!payload.projectDesc) {
            throw new ResponseError(400, "projectDesc is required for PROJECT");
        }
    }
};
const ensureSbuSubsExist = async (sbuSubIds) => {
    if (sbuSubIds.length === 0)
        return;
    const records = await prismaEmployee.em_sbu_sub.findMany({
        where: {
            id: { in: sbuSubIds },
            status: "A",
            OR: [{ isDeleted: false }, { isDeleted: null }],
        },
        select: { id: true },
    });
    const exists = new Set(records.map((record) => record.id));
    const missing = sbuSubIds.filter((id) => !exists.has(id));
    if (missing.length > 0) {
        throw new ResponseError(400, `Invalid SBU Sub: ${missing.join(", ")}`);
    }
};
const normalizeDepartmentIds = (ids) => Array.from(new Set(ids)).filter((id) => id > 0);
const buildEmployeeCaseFilter = async (access) => {
    if (access.actorType !== "EMPLOYEE" || access.employeeId === undefined) {
        return undefined;
    }
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
        { requesterEmployeeId: employeeId },
        {
            departments: {
                some: {
                    isDeleted: false,
                    OR: [
                        {
                            assignees: {
                                some: {
                                    employeeId,
                                    isDeleted: false,
                                },
                            },
                        },
                        { assigneeEmployeeId: employeeId },
                    ],
                },
            },
        },
    ];
    if (picSbuSubIds.length > 0) {
        orFilters.push({
            departments: {
                some: {
                    sbuSubId: { in: picSbuSubIds },
                    isDeleted: false,
                },
            },
        });
        orFilters.push({
            originSbuSubId: { in: picSbuSubIds },
        });
    }
    if (chartSbuSubIds.length > 0) {
        orFilters.push({
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
        });
    }
    return orFilters;
};
export class CaseHeaderService {
    static async create(requesterId, reqBody) {
        const request = Validation.validate(CaseHeaderValidation.CREATE, reqBody);
        const caseType = ensureCaseType(request.caseType);
        const access = await resolveCaseAccess(requesterId);
        if (access.actorType === "FLOWLY") {
            assertCaseCrud(access);
        }
        const departmentIds = normalizeDepartmentIds(request.departmentSbuSubIds);
        if (departmentIds.length === 0) {
            throw new ResponseError(400, "departmentSbuSubIds is required");
        }
        await ensureSbuSubsExist(departmentIds);
        if (request.originSbuSubId !== undefined) {
            await ensureSbuSubsExist([request.originSbuSubId]);
        }
        const caseId = await generateCaseId();
        const now = new Date();
        const visibility = request.visibility
            ? ensureCaseVisibility(request.visibility)
            : "PRIVATE";
        const background = normalizeNullableText(request.background) ?? null;
        const currentCondition = normalizeNullableText(request.currentCondition) ?? null;
        const projectDesc = normalizeNullableText(request.projectDesc) ?? null;
        const projectObjective = normalizeNullableText(request.projectObjective) ?? null;
        ensureCaseRequirements({
            caseType,
            background,
            currentCondition,
            projectDesc,
        });
        const requesterPayload = access.actorType === "EMPLOYEE"
            ? { requesterEmployeeId: access.employeeId ?? null }
            : { requesterId };
        const createDepartmentId = await generateCaseDepartmentId();
        const departmentPayloads = departmentIds.map((sbuSubId) => ({
            caseDepartmentId: createDepartmentId(),
            caseId,
            sbuSubId,
            decisionStatus: "PENDING",
            isActive: true,
            isDeleted: false,
            createdAt: now,
            updatedAt: now,
            createdBy: requesterId,
            updatedBy: requesterId,
        }));
        const created = await prismaFlowly.$transaction(async (tx) => {
            const headerData = {
                caseId,
                caseType,
                caseTitle: request.caseTitle.trim(),
                background,
                currentCondition,
                projectDesc,
                projectObjective,
                locationDesc: normalizeNullableText(request.locationDesc) ?? null,
                notes: normalizeNullableText(request.notes) ?? null,
                status: "NEW",
                visibility,
                originSbuSubId: request.originSbuSubId ?? null,
                isActive: true,
                isDeleted: false,
                createdAt: now,
                updatedAt: now,
                createdBy: requesterId,
                updatedBy: requesterId,
                ...requesterPayload,
            };
            const header = await tx.caseHeader.create({
                data: headerData,
            });
            if (departmentPayloads.length > 0) {
                await tx.caseDepartment.createMany({ data: departmentPayloads });
            }
            return header;
        });
        await writeAuditLog({
            module: "CASE",
            entity: "CASE_HEADER",
            entityId: created.caseId,
            action: "CREATE",
            actorId: requesterId,
            actorType: access.actorType,
            snapshot: getCaseSnapshot(created),
            meta: { departmentCount: departmentPayloads.length },
        });
        const departmentMap = new Map();
        for (const payload of departmentPayloads) {
            departmentMap.set(payload.sbuSubId, payload.caseDepartmentId);
        }
        try {
            await CaseNotificationService.enqueuePicNotifications({
                caseId: created.caseId,
                caseTitle: created.caseTitle,
                caseType: created.caseType,
                departmentMap,
                requesterId,
            });
        }
        catch (error) {
            logger.warn("Failed to enqueue case PIC notifications", {
                caseId: created.caseId,
                error: error?.message ?? error,
            });
        }
        return toCaseHeaderResponse(created);
    }
    static async update(requesterId, reqBody) {
        void requesterId;
        void reqBody;
        // Editing cases is disabled for all roles.
        throw new ResponseError(403, "Case editing is disabled");
    }
    static async softDelete(requesterId, reqBody) {
        const request = Validation.validate(CaseHeaderValidation.DELETE, reqBody);
        const access = await resolveCaseAccess(requesterId);
        if (access.actorType === "FLOWLY") {
            assertCaseCrud(access);
        }
        const existing = await prismaFlowly.caseHeader.findUnique({
            where: { caseId: request.caseId },
        });
        if (!existing || existing.isDeleted) {
            throw new ResponseError(404, "Case not found");
        }
        if (access.actorType === "EMPLOYEE" &&
            access.employeeId !== undefined &&
            existing.requesterEmployeeId !== access.employeeId) {
            throw new ResponseError(403, "Only requester can delete this case");
        }
        const now = new Date();
        const counts = await prismaFlowly.$transaction(async (tx) => {
            const departments = await tx.caseDepartment.updateMany({
                where: { caseId: request.caseId, isDeleted: false },
                data: {
                    isDeleted: true,
                    isActive: false,
                    deletedAt: now,
                    deletedBy: requesterId,
                    updatedAt: now,
                    updatedBy: requesterId,
                },
            });
            const attachments = await tx.caseAttachment.updateMany({
                where: { caseId: request.caseId, isDeleted: false },
                data: {
                    isDeleted: true,
                    isActive: false,
                    deletedAt: now,
                    deletedBy: requesterId,
                    updatedAt: now,
                    updatedBy: requesterId,
                },
            });
            const notifications = await tx.caseNotificationOutbox.updateMany({
                where: { caseId: request.caseId, isDeleted: false },
                data: {
                    isDeleted: true,
                    isActive: false,
                    deletedAt: now,
                    deletedBy: requesterId,
                    updatedAt: now,
                    updatedBy: requesterId,
                },
            });
            const fishbones = await tx.caseFishboneMaster.findMany({
                where: { caseId: request.caseId, isDeleted: false },
                select: { caseFishboneId: true },
            });
            const fishboneIds = fishbones.map((item) => item.caseFishboneId);
            let causeCount = 0;
            let itemCount = 0;
            let itemCauseCount = 0;
            let fishboneCount = 0;
            let pdcaCount = 0;
            if (fishboneIds.length > 0) {
                const items = await tx.caseFishboneItem.findMany({
                    where: { caseFishboneId: { in: fishboneIds }, isDeleted: false },
                    select: { caseFishboneItemId: true },
                });
                const itemIds = items.map((item) => item.caseFishboneItemId);
                if (itemIds.length > 0) {
                    const itemCauseResult = await tx.caseFishboneItemCause.updateMany({
                        where: { caseFishboneItemId: { in: itemIds }, isDeleted: false },
                        data: {
                            isDeleted: true,
                            isActive: false,
                            deletedAt: now,
                            deletedBy: requesterId,
                            updatedAt: now,
                            updatedBy: requesterId,
                        },
                    });
                    itemCauseCount = itemCauseResult.count;
                }
                const causeResult = await tx.caseFishboneCause.updateMany({
                    where: { caseFishboneId: { in: fishboneIds }, isDeleted: false },
                    data: {
                        isDeleted: true,
                        isActive: false,
                        deletedAt: now,
                        deletedBy: requesterId,
                        updatedAt: now,
                        updatedBy: requesterId,
                    },
                });
                causeCount = causeResult.count;
                const itemResult = await tx.caseFishboneItem.updateMany({
                    where: { caseFishboneId: { in: fishboneIds }, isDeleted: false },
                    data: {
                        isDeleted: true,
                        isActive: false,
                        deletedAt: now,
                        deletedBy: requesterId,
                        updatedAt: now,
                        updatedBy: requesterId,
                    },
                });
                itemCount = itemResult.count;
                const fishboneResult = await tx.caseFishboneMaster.updateMany({
                    where: { caseFishboneId: { in: fishboneIds }, isDeleted: false },
                    data: {
                        isDeleted: true,
                        isActive: false,
                        deletedAt: now,
                        deletedBy: requesterId,
                        updatedAt: now,
                        updatedBy: requesterId,
                    },
                });
                fishboneCount = fishboneResult.count;
            }
            const pdcaResult = await tx.casePdcaItem.updateMany({
                where: { caseId: request.caseId, isDeleted: false },
                data: {
                    isDeleted: true,
                    isActive: false,
                    deletedAt: now,
                    deletedBy: requesterId,
                    updatedAt: now,
                    updatedBy: requesterId,
                },
            });
            pdcaCount = pdcaResult.count;
            await tx.caseHeader.update({
                where: { caseId: request.caseId },
                data: {
                    isDeleted: true,
                    isActive: false,
                    deletedAt: now,
                    deletedBy: requesterId,
                    updatedAt: now,
                    updatedBy: requesterId,
                },
            });
            return {
                departments: departments.count,
                attachments: attachments.count,
                notifications: notifications.count,
                fishbones: fishboneCount,
                causes: causeCount,
                items: itemCount,
                itemCauses: itemCauseCount,
                pdcaItems: pdcaCount,
            };
        });
        await writeAuditLog({
            module: "CASE",
            entity: "CASE_HEADER",
            entityId: existing.caseId,
            action: "DELETE",
            actorId: requesterId,
            actorType: resolveActorType(requesterId),
            snapshot: getCaseSnapshot(existing),
            meta: counts,
        });
        return { message: "Case deleted" };
    }
    static async list(requesterId, filters) {
        const access = await resolveCaseAccess(requesterId);
        assertCaseRead(access);
        const whereClause = {
            isDeleted: false,
            ...(access.actorType === "FLOWLY" && !access.canCrud ? { isActive: true } : {}),
            ...(filters?.caseId ? { caseId: filters.caseId } : {}),
            ...(filters?.caseType ? { caseType: filters.caseType } : {}),
            ...(filters?.status ? { status: filters.status } : {}),
            ...(filters?.originSbuSubId !== undefined
                ? { originSbuSubId: filters.originSbuSubId }
                : {}),
            ...(filters?.requesterEmployeeId !== undefined
                ? { requesterEmployeeId: filters.requesterEmployeeId }
                : {}),
            ...(filters?.requesterId ? { requesterId: filters.requesterId } : {}),
        };
        const deptFilters = {
            isDeleted: false,
            ...(filters?.sbuSubId !== undefined ? { sbuSubId: filters.sbuSubId } : {}),
            ...(filters?.assigneeEmployeeId !== undefined
                ? {
                    OR: [
                        {
                            assignees: {
                                some: {
                                    employeeId: filters.assigneeEmployeeId,
                                    isDeleted: false,
                                },
                            },
                        },
                        { assigneeEmployeeId: filters.assigneeEmployeeId },
                    ],
                }
                : {}),
            ...(filters?.decisionStatus ? { decisionStatus: filters.decisionStatus } : {}),
        };
        if (Object.keys(deptFilters).length > 1) {
            whereClause.departments = { some: deptFilters };
        }
        if (access.actorType === "EMPLOYEE") {
            const employeeFilters = await buildEmployeeCaseFilter(access);
            if (!employeeFilters || employeeFilters.length === 0) {
                return [];
            }
            whereClause.OR = employeeFilters;
        }
        const list = await prismaFlowly.caseHeader.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
        });
        if (list.length === 0) {
            return [];
        }
        return list.map(toCaseHeaderListResponse);
    }
}
//# sourceMappingURL=case-header-service.js.map