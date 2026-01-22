import { prismaFlowly } from "../application/database.js";
import { Validation } from "../validation/validation.js";
import { ProcedureIkValidation } from "../validation/procedure-ik-validation.js";
import { ResponseError } from "../error/response-error.js";
import { generateProcedureIkId } from "../utils/id-generator.js";
import { assertProcedureCrud, getProcedureAccess } from "../utils/procedure-access.js";
import { buildRevisionWhere, getBaseNumber, isRevisionNumber } from "../utils/procedure-utils.js";
import { buildChanges, pickSnapshot, writeAuditLog } from "../utils/audit-log.js";
import { toProcedureIkResponse, toProcedureIkListResponse, } from "../model/procedure-ik-model.js";
const IK_AUDIT_FIELDS = [
    "sopId",
    "ikName",
    "ikNumber",
    "effectiveDate",
    "ikContent",
    "isActive",
    "isDeleted",
];
const getIkAuditSnapshot = (record) => pickSnapshot(record, IK_AUDIT_FIELDS);
export class ProcedureIkService {
    static async create(requesterId, reqBody) {
        const request = Validation.validate(ProcedureIkValidation.CREATE, reqBody);
        const access = await getProcedureAccess(requesterId);
        assertProcedureCrud(access);
        const sop = await prismaFlowly.procedureSop.findUnique({
            where: { sopId: request.sopId },
            select: { sopId: true, isDeleted: true, isActive: true },
        });
        if (!sop || sop.isDeleted) {
            throw new ResponseError(404, "SOP not found");
        }
        if (!sop.isActive) {
            throw new ResponseError(400, "SOP is inactive");
        }
        const baseNumber = getBaseNumber(request.ikNumber);
        const activeExisting = await prismaFlowly.procedureIk.findFirst({
            where: {
                sopId: request.sopId,
                isDeleted: false,
                isActive: true,
                ...buildRevisionWhere("ikNumber", baseNumber),
            },
            orderBy: { effectiveDate: "desc" },
        });
        if (activeExisting && request.effectiveDate <= activeExisting.effectiveDate) {
            throw new ResponseError(400, "effectiveDate must be newer than active IK");
        }
        const ikId = await generateProcedureIkId();
        const now = new Date();
        const { created, deactivatedIds } = await prismaFlowly.$transaction(async (tx) => {
            const toDeactivate = await tx.procedureIk.findMany({
                where: {
                    sopId: request.sopId,
                    isDeleted: false,
                    isActive: true,
                    ...buildRevisionWhere("ikNumber", baseNumber),
                },
            });
            const ids = toDeactivate.map((item) => item.ikId);
            if (ids.length > 0) {
                await tx.procedureIk.updateMany({
                    where: { ikId: { in: ids } },
                    data: {
                        isActive: false,
                        updatedAt: now,
                        updatedBy: requesterId,
                    },
                });
            }
            const created = await tx.procedureIk.create({
                data: {
                    ikId,
                    sopId: request.sopId,
                    ikName: request.ikName,
                    ikNumber: request.ikNumber.trim(),
                    effectiveDate: request.effectiveDate,
                    ikContent: request.ikContent ?? null,
                    isActive: true,
                    isDeleted: false,
                    createdBy: requesterId,
                    updatedBy: requesterId,
                },
            });
            return { created, deactivatedIds: ids };
        });
        if (deactivatedIds.length > 0) {
            await writeAuditLog({
                module: "PROCEDURE",
                entity: "IK",
                entityId: created.ikId,
                action: "AUTO_DEACTIVATE",
                actorId: requesterId,
                actorType: access.actorType,
                meta: {
                    ikIds: deactivatedIds,
                },
            });
        }
        await writeAuditLog({
            module: "PROCEDURE",
            entity: "IK",
            entityId: created.ikId,
            action: "CREATE",
            actorId: requesterId,
            actorType: access.actorType,
            snapshot: getIkAuditSnapshot(created),
        });
        return toProcedureIkResponse(created);
    }
    static async update(requesterId, reqBody) {
        const request = Validation.validate(ProcedureIkValidation.UPDATE, reqBody);
        const access = await getProcedureAccess(requesterId);
        assertProcedureCrud(access);
        const existing = await prismaFlowly.procedureIk.findUnique({
            where: { ikId: request.ikId },
        });
        if (!existing || existing.isDeleted) {
            throw new ResponseError(404, "IK not found");
        }
        if (request.effectiveDate) {
            throw new ResponseError(400, "Use create to add new effective date");
        }
        const nextIkNumber = request.ikNumber?.trim();
        if (nextIkNumber && nextIkNumber !== existing.ikNumber) {
            if (isRevisionNumber(nextIkNumber, existing.ikNumber)) {
                throw new ResponseError(400, "Use create to revise IK number");
            }
            const baseNumber = getBaseNumber(nextIkNumber);
            const activeOther = await prismaFlowly.procedureIk.findFirst({
                where: {
                    ikId: { not: existing.ikId },
                    sopId: existing.sopId,
                    isDeleted: false,
                    isActive: true,
                    ...buildRevisionWhere("ikNumber", baseNumber),
                },
            });
            if (activeOther) {
                throw new ResponseError(400, "Another active IK with this number exists");
            }
        }
        if (request.isActive === true && existing.isActive === false) {
            const baseNumber = getBaseNumber(existing.ikNumber);
            const activeOther = await prismaFlowly.procedureIk.findFirst({
                where: {
                    ikId: { not: existing.ikId },
                    sopId: existing.sopId,
                    isDeleted: false,
                    isActive: true,
                    ...buildRevisionWhere("ikNumber", baseNumber),
                },
            });
            if (activeOther) {
                throw new ResponseError(400, "Deactivate other IK revisions first");
            }
        }
        const before = { ...existing };
        const updated = await prismaFlowly.procedureIk.update({
            where: { ikId: request.ikId },
            data: {
                ikName: request.ikName ?? existing.ikName,
                ikNumber: nextIkNumber ?? existing.ikNumber,
                ikContent: request.ikContent === undefined ? existing.ikContent : request.ikContent,
                isActive: request.isActive ?? existing.isActive,
                updatedAt: new Date(),
                updatedBy: requesterId,
            },
        });
        const changes = buildChanges(before, updated, IK_AUDIT_FIELDS);
        if (changes.length > 0) {
            await writeAuditLog({
                module: "PROCEDURE",
                entity: "IK",
                entityId: updated.ikId,
                action: "UPDATE",
                actorId: requesterId,
                actorType: access.actorType,
                changes,
            });
        }
        return toProcedureIkResponse(updated);
    }
    static async softDelete(requesterId, reqBody) {
        const request = Validation.validate(ProcedureIkValidation.DELETE, reqBody);
        const access = await getProcedureAccess(requesterId);
        assertProcedureCrud(access);
        const existing = await prismaFlowly.procedureIk.findUnique({
            where: { ikId: request.ikId },
        });
        if (!existing || existing.isDeleted) {
            throw new ResponseError(404, "IK not found");
        }
        const now = new Date();
        await prismaFlowly.procedureIk.update({
            where: { ikId: request.ikId },
            data: {
                isDeleted: true,
                isActive: false,
                deletedAt: now,
                deletedBy: requesterId,
            },
        });
        await writeAuditLog({
            module: "PROCEDURE",
            entity: "IK",
            entityId: existing.ikId,
            action: "DELETE",
            actorId: requesterId,
            actorType: access.actorType,
            snapshot: getIkAuditSnapshot(existing),
        });
        return { message: "IK deleted" };
    }
    static async list(requesterId, filters) {
        await getProcedureAccess(requesterId);
        if (filters?.sopId) {
            const sop = await prismaFlowly.procedureSop.findUnique({
                where: { sopId: filters.sopId },
                select: { isDeleted: true, isActive: true },
            });
            if (!sop || sop.isDeleted || !sop.isActive) {
                return [];
            }
        }
        const whereClause = {
            isDeleted: false,
            isActive: true,
        };
        if (filters?.sopId) {
            whereClause.sopId = filters.sopId;
        }
        const list = await prismaFlowly.procedureIk.findMany({
            where: whereClause,
            orderBy: { effectiveDate: "desc" },
        });
        return list.map(toProcedureIkListResponse);
    }
}
//# sourceMappingURL=procedure-ik-service.js.map