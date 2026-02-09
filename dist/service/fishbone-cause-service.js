import { prismaFlowly } from "../application/database.js";
import { Validation } from "../validation/validation.js";
import { FishboneCauseValidation } from "../validation/fishbone-cause-validation.js";
import { ResponseError } from "../error/response-error.js";
import { generateFishboneCauseId } from "../utils/id-generator.js";
import { assertProcedureCrud, getProcedureAccess } from "../utils/procedure-access.js";
import { buildChanges, pickSnapshot, writeAuditLog } from "../utils/audit-log.js";
import { toFishboneCauseResponse, toFishboneCauseListResponse, } from "../model/fishbone-cause-model.js";
const FISHBONE_CAUSE_AUDIT_FIELDS = [
    "fishboneId",
    "causeNo",
    "causeText",
    "isActive",
    "isDeleted",
];
const getCauseSnapshot = (record) => pickSnapshot(record, FISHBONE_CAUSE_AUDIT_FIELDS);
const normalizeText = (value) => value.trim();
const ensureFishboneExists = async (fishboneId) => {
    const fishbone = await prismaFlowly.masterFishbone.findUnique({
        where: { fishboneId },
        select: { fishboneId: true, isDeleted: true },
    });
    if (!fishbone || fishbone.isDeleted) {
        throw new ResponseError(404, "Fishbone not found");
    }
};
export class FishboneCauseService {
    static async create(requesterId, reqBody) {
        const request = Validation.validate(FishboneCauseValidation.CREATE, reqBody);
        const access = await getProcedureAccess(requesterId);
        assertProcedureCrud(access);
        await ensureFishboneExists(request.fishboneId);
        const existingNumber = await prismaFlowly.fishboneCause.findFirst({
            where: {
                fishboneId: request.fishboneId,
                causeNo: request.causeNo,
            },
            select: { fishboneCauseId: true },
        });
        if (existingNumber) {
            throw new ResponseError(400, "Cause number already exists");
        }
        const createId = await generateFishboneCauseId();
        const fishboneCauseId = createId();
        const now = new Date();
        const created = await prismaFlowly.fishboneCause.create({
            data: {
                fishboneCauseId,
                fishboneId: request.fishboneId,
                causeNo: request.causeNo,
                causeText: normalizeText(request.causeText),
                isActive: true,
                isDeleted: false,
                createdAt: now,
                updatedAt: now,
                createdBy: requesterId,
                updatedBy: requesterId,
            },
        });
        await writeAuditLog({
            module: "FISHBONE",
            entity: "FISHBONE_CAUSE",
            entityId: created.fishboneCauseId,
            action: "CREATE",
            actorId: requesterId,
            actorType: access.actorType,
            snapshot: getCauseSnapshot(created),
        });
        return toFishboneCauseResponse(created);
    }
    static async update(requesterId, reqBody) {
        const request = Validation.validate(FishboneCauseValidation.UPDATE, reqBody);
        const access = await getProcedureAccess(requesterId);
        assertProcedureCrud(access);
        const existing = await prismaFlowly.fishboneCause.findUnique({
            where: { fishboneCauseId: request.fishboneCauseId },
        });
        if (!existing || existing.isDeleted) {
            throw new ResponseError(404, "Fishbone cause not found");
        }
        if (request.causeNo !== undefined &&
            request.causeNo !== existing.causeNo) {
            const duplicate = await prismaFlowly.fishboneCause.findFirst({
                where: {
                    fishboneId: existing.fishboneId,
                    causeNo: request.causeNo,
                    fishboneCauseId: { not: existing.fishboneCauseId },
                },
                select: { fishboneCauseId: true },
            });
            if (duplicate) {
                throw new ResponseError(400, "Cause number already exists");
            }
        }
        const before = { ...existing };
        const updateData = {
            causeNo: request.causeNo ?? existing.causeNo,
            causeText: request.causeText !== undefined
                ? normalizeText(request.causeText)
                : existing.causeText,
            isActive: request.isActive ?? existing.isActive,
            updatedAt: new Date(),
            updatedBy: requesterId,
        };
        const updated = await prismaFlowly.fishboneCause.update({
            where: { fishboneCauseId: request.fishboneCauseId },
            data: updateData,
        });
        const changes = buildChanges(before, updated, FISHBONE_CAUSE_AUDIT_FIELDS);
        if (changes.length > 0) {
            await writeAuditLog({
                module: "FISHBONE",
                entity: "FISHBONE_CAUSE",
                entityId: updated.fishboneCauseId,
                action: "UPDATE",
                actorId: requesterId,
                actorType: access.actorType,
                changes,
            });
        }
        return toFishboneCauseResponse(updated);
    }
    static async softDelete(requesterId, reqBody) {
        const request = Validation.validate(FishboneCauseValidation.DELETE, reqBody);
        const access = await getProcedureAccess(requesterId);
        assertProcedureCrud(access);
        const existing = await prismaFlowly.fishboneCause.findUnique({
            where: { fishboneCauseId: request.fishboneCauseId },
        });
        if (!existing || existing.isDeleted) {
            throw new ResponseError(404, "Fishbone cause not found");
        }
        const now = new Date();
        const { linkCount } = await prismaFlowly.$transaction(async (tx) => {
            const linkResult = await tx.fishboneItemCause.updateMany({
                where: {
                    fishboneCauseId: request.fishboneCauseId,
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
            await tx.fishboneCause.update({
                where: { fishboneCauseId: request.fishboneCauseId },
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
            module: "FISHBONE",
            entity: "FISHBONE_CAUSE",
            entityId: existing.fishboneCauseId,
            action: "DELETE",
            actorId: requesterId,
            actorType: access.actorType,
            snapshot: getCauseSnapshot(existing),
        };
        await writeAuditLog(linkCount > 0 ? { ...payload, meta: { linkCount } } : payload);
        return { message: "Fishbone cause deleted" };
    }
    static async list(requesterId, filters) {
        const access = await getProcedureAccess(requesterId);
        if (filters?.fishboneId) {
            const fishbone = await prismaFlowly.masterFishbone.findUnique({
                where: { fishboneId: filters.fishboneId },
                select: { isDeleted: true, isActive: true },
            });
            if (!fishbone || fishbone.isDeleted) {
                return [];
            }
            if (!access.canCrud && !fishbone.isActive) {
                return [];
            }
        }
        const whereClause = {
            isDeleted: false,
            ...(access.canCrud ? {} : { isActive: true }),
            ...(filters?.fishboneId ? { fishboneId: filters.fishboneId } : {}),
        };
        const list = await prismaFlowly.fishboneCause.findMany({
            where: whereClause,
            orderBy: { causeNo: "asc" },
        });
        return list.map(toFishboneCauseListResponse);
    }
}
//# sourceMappingURL=fishbone-cause-service.js.map