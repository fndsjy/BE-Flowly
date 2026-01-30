import fs from "fs/promises";
import path from "path";
import { prismaEmployee, prismaFlowly } from "../application/database.js";
import { Validation } from "../validation/validation.js";
import { ProcedureSopValidation } from "../validation/procedure-sop-validation.js";
import { ResponseError } from "../error/response-error.js";
import { generateProcedureSopId } from "../utils/id-generator.js";
import { assertProcedureCrud, getProcedureAccess } from "../utils/procedure-access.js";
import { buildRevisionWhere, getBaseNumber, isRevisionNumber } from "../utils/procedure-utils.js";
import { buildChanges, pickSnapshot, writeAuditLog } from "../utils/audit-log.js";
import { toProcedureSopResponse, toProcedureSopListResponse, } from "../model/procedure-sop-model.js";
const SOP_AUDIT_FIELDS = [
    "sbuSubId",
    "sbuId",
    "pilarId",
    "sopName",
    "sopNumber",
    "effectiveDate",
    "filePath",
    "fileName",
    "fileMime",
    "fileSize",
    "isActive",
    "isDeleted",
];
const getSopAuditSnapshot = (record) => pickSnapshot(record, SOP_AUDIT_FIELDS);
const SOP_UPLOAD_DIR = path.resolve(process.cwd(), "public", "assets", "sop");
const sanitizeFilePart = (value) => {
    const sanitized = value.trim().replace(/[^a-zA-Z0-9]+/g, "_");
    return sanitized.replace(/^_+|_+$/g, "") || "SOP";
};
const normalizeSopNumber = (value) => value.trim().replace(/\//g, "-");
const formatTimestamp = (timestamp) => {
    const pad = (value) => String(value).padStart(2, "0");
    return `${timestamp.getFullYear()}${pad(timestamp.getMonth() + 1)}${pad(timestamp.getDate())}_${pad(timestamp.getHours())}${pad(timestamp.getMinutes())}${pad(timestamp.getSeconds())}`;
};
const buildSopFileName = (sopNumber, timestamp) => {
    const base = sanitizeFilePart(sopNumber).slice(0, 100);
    const dateStamp = formatTimestamp(timestamp);
    return `${base}_${dateStamp}.pdf`;
};
const buildDeletedFileName = (originalFileName, timestamp) => {
    const parsed = path.parse(originalFileName);
    const base = parsed.name || "SOP";
    const ext = parsed.ext || ".pdf";
    const dateStamp = formatTimestamp(timestamp);
    return `${base}_Deleted_${dateStamp}${ext}`;
};
const parseFileData = (fileData) => {
    const match = fileData.match(/^data:(.+);base64,(.*)$/);
    const base64 = match?.[2] ?? fileData;
    const mime = match?.[1] ?? "application/pdf";
    return { mime, base64 };
};
export class ProcedureSopService {
    static async create(requesterId, reqBody) {
        const request = Validation.validate(ProcedureSopValidation.CREATE, reqBody);
        const access = await getProcedureAccess(requesterId);
        assertProcedureCrud(access);
        const sbuSub = await prismaEmployee.em_sbu_sub.findFirst({
            where: {
                id: request.sbuSubId,
                status: "A",
                OR: [{ isDeleted: false }, { isDeleted: null }],
            },
        });
        if (!sbuSub) {
            throw new ResponseError(400, "Invalid SBU Sub");
        }
        const sbuId = sbuSub.sbu_id ?? null;
        const pilarId = sbuSub.sbu_pilar ?? null;
        const normalizedSopNumber = normalizeSopNumber(request.sopNumber);
        const baseNumber = getBaseNumber(normalizedSopNumber);
        const { base64 } = parseFileData(request.fileData);
        const fileBuffer = Buffer.from(base64, "base64");
        if (!fileBuffer.length) {
            throw new ResponseError(400, "File SOP tidak valid");
        }
        const header = fileBuffer.subarray(0, 5).toString("utf8");
        if (header !== "%PDF-") {
            throw new ResponseError(400, "File harus PDF");
        }
        const activeExisting = await prismaFlowly.procedureSop.findFirst({
            where: {
                sbuSubId: request.sbuSubId,
                isDeleted: false,
                isActive: true,
                ...buildRevisionWhere("sopNumber", baseNumber),
            },
            orderBy: { effectiveDate: "desc" },
        });
        if (activeExisting && request.effectiveDate <= activeExisting.effectiveDate) {
            throw new ResponseError(400, "effectiveDate must be newer than active SOP");
        }
        const sopId = await generateProcedureSopId();
        const now = new Date();
        const fileName = buildSopFileName(request.sopName, now);
        const filePath = `/assets/sop/${fileName}`;
        const fileMime = "application/pdf";
        const fileSize = fileBuffer.length;
        const fileFullPath = path.join(SOP_UPLOAD_DIR, fileName);
        await fs.mkdir(SOP_UPLOAD_DIR, { recursive: true });
        await fs.writeFile(fileFullPath, fileBuffer);
        let createdRecord;
        let deactivatedIds = [];
        let deactivatedIkCount = 0;
        try {
            const result = await prismaFlowly.$transaction(async (tx) => {
                const toDeactivate = await tx.procedureSop.findMany({
                    where: {
                        sbuSubId: request.sbuSubId,
                        isDeleted: false,
                        isActive: true,
                        ...buildRevisionWhere("sopNumber", baseNumber),
                    },
                });
                const ids = toDeactivate.map((item) => item.sopId);
                let ikCount = 0;
                if (ids.length > 0) {
                    await tx.procedureSop.updateMany({
                        where: { sopId: { in: ids } },
                        data: {
                            isActive: false,
                            updatedAt: now,
                            updatedBy: requesterId,
                        },
                    });
                    const ikResult = await tx.procedureSopIK.updateMany({
                        where: {
                            sopId: { in: ids },
                            isDeleted: false,
                            isActive: true,
                        },
                        data: {
                            isActive: false,
                            updatedAt: now,
                            updatedBy: requesterId,
                        },
                    });
                    ikCount = ikResult.count;
                }
                const created = await tx.procedureSop.create({
                    data: {
                        sopId,
                        sbuSubId: request.sbuSubId,
                        sbuId,
                        pilarId,
                        sopName: request.sopName,
                        sopNumber: normalizedSopNumber,
                        effectiveDate: request.effectiveDate,
                        filePath,
                        fileName,
                        fileMime,
                        fileSize,
                        isActive: true,
                        isDeleted: false,
                        createdBy: requesterId,
                        updatedBy: requesterId,
                    },
                });
                return { created, deactivatedIds: ids, deactivatedIkCount: ikCount };
            });
            createdRecord = result.created;
            deactivatedIds = result.deactivatedIds;
            deactivatedIkCount = result.deactivatedIkCount;
        }
        catch (err) {
            await fs.unlink(fileFullPath).catch(() => undefined);
            throw err;
        }
        if (!createdRecord) {
            throw new ResponseError(500, "Failed to create SOP");
        }
        if (deactivatedIds.length > 0) {
            await writeAuditLog({
                module: "PROCEDURE",
                entity: "SOP",
                entityId: createdRecord.sopId,
                action: "AUTO_DEACTIVATE",
                actorId: requesterId,
                actorType: access.actorType,
                meta: {
                    sopIds: deactivatedIds,
                    ikCount: deactivatedIkCount,
                },
            });
        }
        await writeAuditLog({
            module: "PROCEDURE",
            entity: "SOP",
            entityId: createdRecord.sopId,
            action: "CREATE",
            actorId: requesterId,
            actorType: access.actorType,
            snapshot: getSopAuditSnapshot(createdRecord),
        });
        return toProcedureSopResponse(createdRecord);
    }
    static async update(requesterId, reqBody) {
        const request = Validation.validate(ProcedureSopValidation.UPDATE, reqBody);
        const access = await getProcedureAccess(requesterId);
        assertProcedureCrud(access);
        const existing = await prismaFlowly.procedureSop.findUnique({
            where: { sopId: request.sopId },
        });
        if (!existing || existing.isDeleted) {
            throw new ResponseError(404, "SOP not found");
        }
        if (request.effectiveDate) {
            throw new ResponseError(400, "Use create to add new effective date");
        }
        const normalizedNextSopNumber = request.sopNumber !== undefined ? normalizeSopNumber(request.sopNumber) : undefined;
        const nextSopNumber = normalizedNextSopNumber && normalizedNextSopNumber.length > 0
            ? normalizedNextSopNumber
            : undefined;
        if (nextSopNumber && nextSopNumber !== existing.sopNumber) {
            if (isRevisionNumber(nextSopNumber, existing.sopNumber)) {
                throw new ResponseError(400, "Use create to revise SOP number");
            }
            const baseNumber = getBaseNumber(nextSopNumber);
            const activeOther = await prismaFlowly.procedureSop.findFirst({
                where: {
                    sopId: { not: existing.sopId },
                    sbuSubId: existing.sbuSubId,
                    isDeleted: false,
                    isActive: true,
                    ...buildRevisionWhere("sopNumber", baseNumber),
                },
            });
            if (activeOther) {
                throw new ResponseError(400, "Another active SOP with this number exists");
            }
        }
        if (request.isActive === true && existing.isActive === false) {
            const targetNumber = nextSopNumber ?? existing.sopNumber;
            const baseNumber = getBaseNumber(targetNumber);
            const otherWithSameBase = await prismaFlowly.procedureSop.findFirst({
                where: {
                    sopId: { not: existing.sopId },
                    sbuSubId: existing.sbuSubId,
                    isDeleted: false,
                    ...buildRevisionWhere("sopNumber", baseNumber),
                },
                select: { sopId: true },
            });
            if (otherWithSameBase) {
                throw new ResponseError(400, "Cannot activate SOP while another revision with the same base number exists. Change SOP number first");
            }
        }
        const now = new Date();
        let filePayload;
        let newFileFullPath;
        let oldFileFullPath;
        let oldFileRenamedPath;
        if (request.fileData !== undefined) {
            const { base64 } = parseFileData(request.fileData);
            const fileBuffer = Buffer.from(base64, "base64");
            if (!fileBuffer.length) {
                throw new ResponseError(400, "File SOP tidak valid");
            }
            const header = fileBuffer.subarray(0, 5).toString("utf8");
            if (header !== "%PDF-") {
                throw new ResponseError(400, "File harus PDF");
            }
            const nameForFile = request.sopName ?? existing.sopName;
            const fileName = buildSopFileName(nameForFile, now);
            const filePath = `/assets/sop/${fileName}`;
            const fileMime = "application/pdf";
            const fileSize = fileBuffer.length;
            newFileFullPath = path.join(SOP_UPLOAD_DIR, fileName);
            await fs.mkdir(SOP_UPLOAD_DIR, { recursive: true });
            await fs.writeFile(newFileFullPath, fileBuffer);
            filePayload = { filePath, fileName, fileMime, fileSize };
            if (existing.fileName) {
                oldFileFullPath = path.join(SOP_UPLOAD_DIR, existing.fileName);
                const deletedFileName = buildDeletedFileName(existing.fileName, now);
                oldFileRenamedPath = path.join(SOP_UPLOAD_DIR, deletedFileName);
            }
        }
        const before = { ...existing };
        let updated;
        try {
            updated = await prismaFlowly.procedureSop.update({
                where: { sopId: request.sopId },
                data: {
                    sopName: request.sopName ?? existing.sopName,
                    sopNumber: nextSopNumber ?? existing.sopNumber,
                    isActive: request.isActive ?? existing.isActive,
                    ...(filePayload ?? {}),
                    updatedAt: now,
                    updatedBy: requesterId,
                },
            });
        }
        catch (err) {
            if (newFileFullPath) {
                await fs.unlink(newFileFullPath).catch(() => undefined);
            }
            throw err;
        }
        if (oldFileFullPath && oldFileRenamedPath) {
            try {
                await fs.access(oldFileFullPath);
                await fs.rename(oldFileFullPath, oldFileRenamedPath);
            }
            catch {
                // Best-effort: keep old file if rename fails.
            }
        }
        let deactivatedIkCount = 0;
        if (request.isActive === false && existing.isActive) {
            const ikResult = await prismaFlowly.procedureSopIK.updateMany({
                where: {
                    sopId: existing.sopId,
                    isDeleted: false,
                    isActive: true,
                },
                data: {
                    isActive: false,
                    updatedAt: new Date(),
                    updatedBy: requesterId,
                },
            });
            deactivatedIkCount = ikResult.count;
        }
        const changes = buildChanges(before, updated, SOP_AUDIT_FIELDS);
        if (changes.length > 0 || deactivatedIkCount > 0) {
            const payload = {
                module: "PROCEDURE",
                entity: "SOP",
                entityId: updated.sopId,
                action: "UPDATE",
                actorId: requesterId,
                actorType: access.actorType,
                changes,
            };
            const meta = deactivatedIkCount > 0 ? { ikCount: deactivatedIkCount } : undefined;
            await writeAuditLog(meta ? { ...payload, meta } : payload);
        }
        return toProcedureSopResponse(updated);
    }
    static async softDelete(requesterId, reqBody) {
        const request = Validation.validate(ProcedureSopValidation.DELETE, reqBody);
        const access = await getProcedureAccess(requesterId);
        assertProcedureCrud(access);
        const existing = await prismaFlowly.procedureSop.findUnique({
            where: { sopId: request.sopId },
        });
        if (!existing || existing.isDeleted) {
            throw new ResponseError(404, "SOP not found");
        }
        const now = new Date();
        const { ikDeletedCount } = await prismaFlowly.$transaction(async (tx) => {
            const ikResult = await tx.procedureSopIK.updateMany({
                where: { sopId: request.sopId, isDeleted: false },
                data: {
                    isDeleted: true,
                    isActive: false,
                    deletedAt: now,
                    deletedBy: requesterId,
                },
            });
            await tx.procedureSop.update({
                where: { sopId: request.sopId },
                data: {
                    isDeleted: true,
                    isActive: false,
                    deletedAt: now,
                    deletedBy: requesterId,
                },
            });
            return { ikDeletedCount: ikResult.count };
        });
        const payload = {
            module: "PROCEDURE",
            entity: "SOP",
            entityId: existing.sopId,
            action: "DELETE",
            actorId: requesterId,
            actorType: access.actorType,
            snapshot: getSopAuditSnapshot(existing),
        };
        const meta = ikDeletedCount > 0 ? { ikCount: ikDeletedCount } : undefined;
        await writeAuditLog(meta ? { ...payload, meta } : payload);
        return { message: "SOP deleted" };
    }
    static async list(requesterId, filters) {
        const access = await getProcedureAccess(requesterId);
        if (filters?.sbuSubId) {
            const sub = await prismaEmployee.em_sbu_sub.findFirst({
                where: { id: filters.sbuSubId },
                select: { isDeleted: true },
            });
            if (!sub || sub.isDeleted === true) {
                return [];
            }
        }
        const whereClause = {
            isDeleted: false,
            ...(access.canCrud ? {} : { isActive: true }),
        };
        if (filters?.sbuSubId !== undefined) {
            whereClause.sbuSubId = filters.sbuSubId;
        }
        if (filters?.sbuId !== undefined) {
            whereClause.sbuId = filters.sbuId;
        }
        if (filters?.pilarId !== undefined) {
            whereClause.pilarId = filters.pilarId;
        }
        if (filters?.sopNumber) {
            whereClause.sopNumber = filters.sopNumber;
        }
        const list = await prismaFlowly.procedureSop.findMany({
            where: whereClause,
            orderBy: { effectiveDate: "desc" },
        });
        return list.map(toProcedureSopListResponse);
    }
    static async getFile(requesterId, sopId) {
        const access = await getProcedureAccess(requesterId);
        const sop = await prismaFlowly.procedureSop.findUnique({
            where: { sopId },
        });
        if (!sop || sop.isDeleted) {
            throw new ResponseError(404, "SOP not found");
        }
        if (!access.canCrud && !sop.isActive) {
            throw new ResponseError(404, "SOP not found");
        }
        const fileName = sop.fileName;
        const fileMime = sop.fileMime ?? "application/pdf";
        const fullPath = path.join(SOP_UPLOAD_DIR, fileName);
        try {
            await fs.access(fullPath);
        }
        catch {
            throw new ResponseError(404, "File not found");
        }
        return { fullPath, fileName, fileMime };
    }
}
//# sourceMappingURL=procedure-sop-service.js.map