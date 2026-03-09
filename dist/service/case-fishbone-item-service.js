import { prismaFlowly } from "../application/database.js";
import { Validation } from "../validation/validation.js";
import { CaseFishboneItemValidation } from "../validation/case-fishbone-item-validation.js";
import { ResponseError } from "../error/response-error.js";
import { generateCaseFishboneItemId, generateCaseFishboneItemCauseId, } from "../utils/id-generator.js";
import { buildChanges, pickSnapshot, resolveActorType, writeAuditLog, } from "../utils/audit-log.js";
import { assertCaseCrud, assertCaseRead, ensureCaseNotClosed, isPicForSbuSub, isAssigneeForSbuSub, canEmployeeViewFishbone, resolveCaseAccess, } from "../utils/case-access.js";
import { toCaseFishboneItemResponse, toCaseFishboneItemListResponse, } from "../model/case-fishbone-item-model.js";
const normalizeCategoryCode = (value) => value.trim().toUpperCase();
const ensureCategoryExists = async (categoryCode, requireActive = true) => {
    const category = await prismaFlowly.fishboneCategory.findUnique({
        where: { categoryCode },
        select: { categoryCode: true, isActive: true, isDeleted: true },
    });
    if (!category || category.isDeleted) {
        throw new ResponseError(404, "Fishbone category not found");
    }
    if (requireActive && !category.isActive) {
        throw new ResponseError(400, "Fishbone category not active");
    }
};
const normalizeCauseIds = (causeIds) => Array.from(new Set(causeIds.map((id) => id.trim()).filter((id) => id.length > 0)));
const ensureCaseFishboneAccess = async (caseFishboneId, employeeId) => {
    const fishbone = await prismaFlowly.caseFishboneMaster.findUnique({
        where: { caseFishboneId },
        select: { caseFishboneId: true, caseId: true, sbuSubId: true, isDeleted: true },
    });
    if (!fishbone || fishbone.isDeleted) {
        throw new ResponseError(404, "Case fishbone not found");
    }
    if (employeeId !== undefined) {
        const department = await prismaFlowly.caseDepartment.findFirst({
            where: {
                caseId: fishbone.caseId,
                sbuSubId: fishbone.sbuSubId,
                isDeleted: false,
            },
            select: { caseDepartmentId: true },
        });
        if (!department) {
            throw new ResponseError(404, "Case department not found");
        }
        const isPic = await isPicForSbuSub(employeeId, fishbone.sbuSubId);
        const isAssignee = await isAssigneeForSbuSub(employeeId, fishbone.caseId, fishbone.sbuSubId);
        if (!isPic && !isAssignee) {
            throw new ResponseError(403, "No access to case fishbone");
        }
    }
    return fishbone;
};
const ensureCausesExist = async (caseFishboneId, causeIds) => {
    const normalized = normalizeCauseIds(causeIds);
    if (normalized.length === 0) {
        throw new ResponseError(400, "causeIds is required");
    }
    const causes = await prismaFlowly.caseFishboneCause.findMany({
        where: {
            caseFishboneCauseId: { in: normalized },
            caseFishboneId,
            isDeleted: false,
        },
        select: { caseFishboneCauseId: true, isActive: true },
    });
    const causeMap = new Map(causes.map((cause) => [cause.caseFishboneCauseId, cause]));
    const missingIds = normalized.filter((id) => !causeMap.has(id));
    if (missingIds.length > 0) {
        throw new ResponseError(404, `Case fishbone cause not found: ${missingIds.join(", ")}`);
    }
    const inactiveIds = causes
        .filter((cause) => !cause.isActive)
        .map((cause) => cause.caseFishboneCauseId);
    if (inactiveIds.length > 0) {
        throw new ResponseError(400, `Case fishbone cause not active: ${inactiveIds.join(", ")}`);
    }
    return normalized;
};
const ITEM_AUDIT_FIELDS = [
    "caseFishboneId",
    "categoryCode",
    "problemText",
    "solutionText",
    "isActive",
    "isDeleted",
];
const getItemSnapshot = (record) => pickSnapshot(record, ITEM_AUDIT_FIELDS);
const ITEM_CAUSE_AUDIT_FIELDS = [
    "caseFishboneItemId",
    "caseFishboneCauseId",
    "isActive",
    "isDeleted",
];
const getItemCauseSnapshot = (record) => pickSnapshot(record, ITEM_CAUSE_AUDIT_FIELDS);
const syncItemCauseLinks = async (caseFishboneItemId, causeIds, requesterId) => {
    const auditPayload = {
        created: [],
        reactivated: [],
        deleted: [],
    };
    const existingLinks = await prismaFlowly.caseFishboneItemCause.findMany({
        where: { caseFishboneItemId },
    });
    const existingByCauseId = new Map();
    for (const link of existingLinks) {
        if (!existingByCauseId.has(link.caseFishboneCauseId)) {
            existingByCauseId.set(link.caseFishboneCauseId, link);
        }
    }
    const toCreate = [];
    const toReactivate = [];
    const toDelete = [];
    for (const causeId of causeIds) {
        const existing = existingByCauseId.get(causeId);
        if (!existing) {
            toCreate.push(causeId);
            continue;
        }
        if (existing.isDeleted || !existing.isActive) {
            toReactivate.push(existing);
        }
    }
    for (const link of existingLinks) {
        if (!causeIds.includes(link.caseFishboneCauseId) && !link.isDeleted) {
            toDelete.push(link);
        }
    }
    const now = new Date();
    const createId = await generateCaseFishboneItemCauseId();
    const createPayloads = toCreate.map((caseFishboneCauseId) => ({
        caseFishboneItemCauseId: createId(),
        caseFishboneItemId,
        caseFishboneCauseId,
        isActive: true,
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
        createdBy: requesterId,
        updatedBy: requesterId,
    }));
    await prismaFlowly.$transaction(async (tx) => {
        if (toReactivate.length > 0) {
            await tx.caseFishboneItemCause.updateMany({
                where: {
                    caseFishboneItemCauseId: {
                        in: toReactivate.map((link) => link.caseFishboneItemCauseId),
                    },
                },
                data: {
                    isDeleted: false,
                    isActive: true,
                    deletedAt: null,
                    deletedBy: null,
                    updatedAt: now,
                    updatedBy: requesterId,
                },
            });
        }
        if (toDelete.length > 0) {
            await tx.caseFishboneItemCause.updateMany({
                where: {
                    caseFishboneItemCauseId: {
                        in: toDelete.map((link) => link.caseFishboneItemCauseId),
                    },
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
        }
        if (createPayloads.length > 0) {
            await tx.caseFishboneItemCause.createMany({
                data: createPayloads,
            });
        }
    });
    auditPayload.created = createPayloads.map((payload) => ({
        caseFishboneItemCauseId: payload.caseFishboneItemCauseId,
        caseFishboneItemId: payload.caseFishboneItemId,
        caseFishboneCauseId: payload.caseFishboneCauseId,
        isActive: payload.isActive,
        isDeleted: payload.isDeleted,
    }));
    auditPayload.reactivated = toReactivate.map((link) => {
        const after = {
            ...link,
            isDeleted: false,
            isActive: true,
            deletedAt: null,
            deletedBy: null,
        };
        return {
            before: link,
            after,
        };
    });
    auditPayload.deleted = toDelete.map((link) => link);
    return auditPayload;
};
const writeItemCauseAuditLogs = async (audit, requesterId, actorType) => {
    for (const payload of audit.created) {
        await writeAuditLog({
            module: "CASE",
            entity: "CASE_FISHBONE_ITEM_CAUSE",
            entityId: payload.caseFishboneItemCauseId,
            action: "CREATE",
            actorId: requesterId,
            actorType,
            snapshot: getItemCauseSnapshot(payload),
            meta: { caseFishboneItemId: payload.caseFishboneItemId },
        });
    }
    for (const change of audit.reactivated) {
        const changes = buildChanges(change.before, change.after, ITEM_CAUSE_AUDIT_FIELDS);
        if (changes.length > 0) {
            await writeAuditLog({
                module: "CASE",
                entity: "CASE_FISHBONE_ITEM_CAUSE",
                entityId: String(change.before.caseFishboneItemCauseId),
                action: "UPDATE",
                actorId: requesterId,
                actorType,
                changes,
                meta: {
                    caseFishboneItemId: change.before.caseFishboneItemId,
                    caseFishboneCauseId: change.before.caseFishboneCauseId,
                },
            });
        }
    }
    for (const payload of audit.deleted) {
        await writeAuditLog({
            module: "CASE",
            entity: "CASE_FISHBONE_ITEM_CAUSE",
            entityId: String(payload.caseFishboneItemCauseId),
            action: "DELETE",
            actorId: requesterId,
            actorType,
            snapshot: getItemCauseSnapshot(payload),
            meta: {
                caseFishboneItemId: payload.caseFishboneItemId,
                caseFishboneCauseId: payload.caseFishboneCauseId,
            },
        });
    }
};
export class CaseFishboneItemService {
    static async create(requesterId, reqBody) {
        const request = Validation.validate(CaseFishboneItemValidation.CREATE, reqBody);
        const access = await resolveCaseAccess(requesterId);
        let fishbone = null;
        if (access.actorType === "FLOWLY") {
            assertCaseCrud(access);
            fishbone = await ensureCaseFishboneAccess(request.caseFishboneId);
        }
        else if (access.employeeId !== undefined) {
            fishbone = await ensureCaseFishboneAccess(request.caseFishboneId, access.employeeId);
        }
        else {
            fishbone = await ensureCaseFishboneAccess(request.caseFishboneId);
        }
        if (fishbone) {
            await ensureCaseNotClosed(fishbone.caseId);
        }
        const normalizedCauseIds = await ensureCausesExist(request.caseFishboneId, request.causeIds);
        const caseFishboneItemId = (await generateCaseFishboneItemId())();
        const now = new Date();
        const categoryCode = normalizeCategoryCode(request.categoryCode);
        await ensureCategoryExists(categoryCode, true);
        const createLinkId = await generateCaseFishboneItemCauseId();
        const linkPayloads = normalizedCauseIds.map((caseFishboneCauseId) => ({
            caseFishboneItemCauseId: createLinkId(),
            caseFishboneItemId,
            caseFishboneCauseId,
            isActive: true,
            isDeleted: false,
            createdAt: now,
            updatedAt: now,
            createdBy: requesterId,
            updatedBy: requesterId,
        }));
        await prismaFlowly.$transaction(async (tx) => {
            await tx.caseFishboneItem.create({
                data: {
                    caseFishboneItemId,
                    case_fishbone: { connect: { caseFishboneId: request.caseFishboneId } },
                    category: { connect: { categoryCode } },
                    problemText: request.problemText.trim(),
                    solutionText: request.solutionText.trim(),
                    isActive: true,
                    isDeleted: false,
                    createdAt: now,
                    updatedAt: now,
                    createdBy: requesterId,
                    updatedBy: requesterId,
                },
            });
            if (linkPayloads.length > 0) {
                await tx.caseFishboneItemCause.createMany({
                    data: linkPayloads,
                });
            }
        });
        await writeAuditLog({
            module: "CASE",
            entity: "CASE_FISHBONE_ITEM",
            entityId: caseFishboneItemId,
            action: "CREATE",
            actorId: requesterId,
            actorType: access.actorType,
            snapshot: getItemSnapshot({
                caseFishboneId: request.caseFishboneId,
                categoryCode,
                problemText: request.problemText.trim(),
                solutionText: request.solutionText.trim(),
                isActive: true,
                isDeleted: false,
            }),
        });
        if (linkPayloads.length > 0) {
            for (const payload of linkPayloads) {
                await writeAuditLog({
                    module: "CASE",
                    entity: "CASE_FISHBONE_ITEM_CAUSE",
                    entityId: payload.caseFishboneItemCauseId,
                    action: "CREATE",
                    actorId: requesterId,
                    actorType: access.actorType,
                    snapshot: getItemCauseSnapshot(payload),
                    meta: { caseFishboneItemId },
                });
            }
        }
        const created = await prismaFlowly.caseFishboneItem.findUnique({
            where: { caseFishboneItemId },
            include: {
                causeLinks: {
                    where: { isDeleted: false },
                    include: {
                        cause: {
                            select: {
                                caseFishboneCauseId: true,
                                causeNo: true,
                                causeText: true,
                                isActive: true,
                                isDeleted: true,
                            },
                        },
                    },
                },
            },
        });
        if (!created) {
            throw new ResponseError(500, "Failed to create case fishbone item");
        }
        return toCaseFishboneItemResponse(created);
    }
    static async update(requesterId, reqBody) {
        const request = Validation.validate(CaseFishboneItemValidation.UPDATE, reqBody);
        const access = await resolveCaseAccess(requesterId);
        if (access.actorType === "FLOWLY") {
            assertCaseCrud(access);
        }
        const existing = await prismaFlowly.caseFishboneItem.findUnique({
            where: { caseFishboneItemId: request.caseFishboneItemId },
        });
        if (!existing || existing.isDeleted) {
            throw new ResponseError(404, "Case fishbone item not found");
        }
        const fishbone = await ensureCaseFishboneAccess(existing.caseFishboneId, access.actorType === "EMPLOYEE" ? access.employeeId : undefined);
        await ensureCaseNotClosed(fishbone.caseId);
        let normalizedCauseIds;
        if (request.causeIds !== undefined) {
            normalizedCauseIds = await ensureCausesExist(existing.caseFishboneId, request.causeIds);
        }
        const before = { ...existing };
        const nextCategoryCode = request.categoryCode !== undefined
            ? normalizeCategoryCode(request.categoryCode)
            : existing.categoryCode;
        if (request.categoryCode !== undefined) {
            await ensureCategoryExists(nextCategoryCode, true);
        }
        const updateData = {
            problemText: request.problemText !== undefined
                ? request.problemText.trim()
                : existing.problemText,
            solutionText: request.solutionText !== undefined
                ? request.solutionText.trim()
                : existing.solutionText,
            isActive: request.isActive ?? existing.isActive,
            updatedAt: new Date(),
            updatedBy: requesterId,
        };
        if (request.categoryCode !== undefined) {
            updateData.category = { connect: { categoryCode: nextCategoryCode } };
        }
        const updated = await prismaFlowly.caseFishboneItem.update({
            where: { caseFishboneItemId: request.caseFishboneItemId },
            data: updateData,
        });
        const changes = buildChanges(before, updated, ITEM_AUDIT_FIELDS);
        if (changes.length > 0) {
            await writeAuditLog({
                module: "CASE",
                entity: "CASE_FISHBONE_ITEM",
                entityId: updated.caseFishboneItemId,
                action: "UPDATE",
                actorId: requesterId,
                actorType: resolveActorType(requesterId),
                changes,
            });
        }
        if (normalizedCauseIds) {
            const auditPayload = await syncItemCauseLinks(updated.caseFishboneItemId, normalizedCauseIds, requesterId);
            await writeItemCauseAuditLogs(auditPayload, requesterId, access.actorType);
        }
        const refreshed = await prismaFlowly.caseFishboneItem.findUnique({
            where: { caseFishboneItemId: updated.caseFishboneItemId },
            include: {
                causeLinks: {
                    where: { isDeleted: false },
                    include: {
                        cause: {
                            select: {
                                caseFishboneCauseId: true,
                                causeNo: true,
                                causeText: true,
                                isActive: true,
                                isDeleted: true,
                            },
                        },
                    },
                },
            },
        });
        if (!refreshed) {
            throw new ResponseError(500, "Failed to load case fishbone item");
        }
        return toCaseFishboneItemResponse(refreshed);
    }
    static async softDelete(requesterId, reqBody) {
        const request = Validation.validate(CaseFishboneItemValidation.DELETE, reqBody);
        const access = await resolveCaseAccess(requesterId);
        if (access.actorType === "FLOWLY") {
            assertCaseCrud(access);
        }
        const existing = await prismaFlowly.caseFishboneItem.findUnique({
            where: { caseFishboneItemId: request.caseFishboneItemId },
        });
        if (!existing || existing.isDeleted) {
            throw new ResponseError(404, "Case fishbone item not found");
        }
        const fishbone = await ensureCaseFishboneAccess(existing.caseFishboneId, access.actorType === "EMPLOYEE" ? access.employeeId : undefined);
        await ensureCaseNotClosed(fishbone.caseId);
        const now = new Date();
        const { linkCount } = await prismaFlowly.$transaction(async (tx) => {
            const linkResult = await tx.caseFishboneItemCause.updateMany({
                where: { caseFishboneItemId: request.caseFishboneItemId, isDeleted: false },
                data: {
                    isDeleted: true,
                    isActive: false,
                    deletedAt: now,
                    deletedBy: requesterId,
                    updatedAt: now,
                    updatedBy: requesterId,
                },
            });
            await tx.caseFishboneItem.update({
                where: { caseFishboneItemId: request.caseFishboneItemId },
                data: {
                    isDeleted: true,
                    isActive: false,
                    deletedAt: now,
                    deletedBy: requesterId,
                    updatedAt: now,
                    updatedBy: requesterId,
                },
            });
            return { linkCount: linkResult.count };
        });
        const payload = {
            module: "CASE",
            entity: "CASE_FISHBONE_ITEM",
            entityId: existing.caseFishboneItemId,
            action: "DELETE",
            actorId: requesterId,
            actorType: access.actorType,
            snapshot: getItemSnapshot(existing),
        };
        await writeAuditLog(linkCount > 0 ? { ...payload, meta: { linkCount } } : payload);
        return { message: "Case fishbone item deleted" };
    }
    static async list(requesterId, filters) {
        const access = await resolveCaseAccess(requesterId);
        assertCaseRead(access);
        if (access.actorType === "EMPLOYEE" && access.employeeId !== undefined) {
            if (!filters?.caseFishboneId) {
                return [];
            }
            const canView = await canEmployeeViewFishbone(access.employeeId, filters.caseFishboneId);
            if (!canView) {
                return [];
            }
        }
        const categoryCode = filters?.categoryCode !== undefined
            ? normalizeCategoryCode(filters.categoryCode)
            : undefined;
        if (categoryCode) {
            const category = await prismaFlowly.fishboneCategory.findUnique({
                where: { categoryCode },
                select: { isActive: true, isDeleted: true },
            });
            if (!category || category.isDeleted) {
                return [];
            }
            if (access.actorType === "FLOWLY" && !access.canCrud && !category.isActive) {
                return [];
            }
        }
        const whereClause = {
            isDeleted: false,
            ...(filters?.caseFishboneId ? { caseFishboneId: filters.caseFishboneId } : {}),
            ...(categoryCode ? { categoryCode } : {}),
            ...(access.actorType === "FLOWLY" && !access.canCrud ? { isActive: true } : {}),
            ...(access.actorType === "FLOWLY" && !access.canCrud
                ? {
                    category: {
                        isActive: true,
                        isDeleted: false,
                    },
                }
                : {}),
        };
        const linkWhere = {
            isDeleted: false,
            ...(access.actorType === "FLOWLY" && !access.canCrud ? { isActive: true } : {}),
        };
        const list = await prismaFlowly.caseFishboneItem.findMany({
            where: whereClause,
            include: {
                causeLinks: {
                    where: {
                        ...linkWhere,
                        ...(access.actorType === "FLOWLY" && !access.canCrud
                            ? {
                                cause: {
                                    isActive: true,
                                    isDeleted: false,
                                },
                            }
                            : {}),
                    },
                    include: {
                        cause: {
                            select: {
                                caseFishboneCauseId: true,
                                causeNo: true,
                                causeText: true,
                                isActive: true,
                                isDeleted: true,
                            },
                        },
                    },
                },
            },
            orderBy: [{ categoryCode: "asc" }, { createdAt: "asc" }],
        });
        return list.map(toCaseFishboneItemListResponse);
    }
}
//# sourceMappingURL=case-fishbone-item-service.js.map