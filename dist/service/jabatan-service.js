import { prismaFlowly } from "../application/database.js";
import { Validation } from "../validation/validation.js";
import { JabatanValidation } from "../validation/jabatan-validation.js";
import { ResponseError } from "../error/response-error.js";
import { generateJabatanId } from "../utils/id-generator.js";
import { toJabatanResponse, toJabatanListResponse } from "../model/jabatan-model.js";
export class JabatanService {
    /* ---------- CREATE ---------- */
    static async create(requesterId, reqBody) {
        const req = Validation.validate(JabatanValidation.CREATE, reqBody);
        const requester = await prismaFlowly.user.findUnique({
            where: { userId: requesterId },
            include: { role: true }
        });
        if (!requester || requester.role.roleLevel !== 1) {
            throw new ResponseError(403, "Only admin can create jabatan");
        }
        const jabatanId = await generateJabatanId();
        const lastLevel = await prismaFlowly.jabatan.findFirst({
            where: { isDeleted: false },
            orderBy: { jabatanLevel: "desc" },
            select: { jabatanLevel: true }
        });
        const nextLevel = lastLevel ? lastLevel.jabatanLevel + 1 : 1;
        const now = new Date();
        const created = await prismaFlowly.jabatan.create({
            data: {
                jabatanId,
                jabatanName: req.jabatanName,
                jabatanLevel: nextLevel,
                jabatanDesc: req.jabatanDesc ?? null,
                jabatanIsActive: true,
                isDeleted: false,
                createdAt: now,
                updatedAt: now,
                createdBy: requesterId,
                updatedBy: requesterId
            }
        });
        return toJabatanResponse(created);
    }
    /* ---------- UPDATE ---------- */
    static async update(requesterId, reqBody) {
        const req = Validation.validate(JabatanValidation.UPDATE, reqBody);
        const requester = await prismaFlowly.user.findUnique({
            where: { userId: requesterId },
            include: { role: true }
        });
        if (!requester || requester.role.roleLevel !== 1) {
            throw new ResponseError(403, "Only admin can update jabatan");
        }
        const existing = await prismaFlowly.jabatan.findUnique({
            where: { jabatanId: req.jabatanId }
        });
        if (!existing || existing.isDeleted) {
            throw new ResponseError(404, "Jabatan not found");
        }
        const finalDesc = req.jabatanDesc === undefined ? existing.jabatanDesc : req.jabatanDesc;
        const finalIsActive = req.jabatanIsActive ?? existing.jabatanIsActive;
        const finalLevel = req.jabatanLevel ?? existing.jabatanLevel;
        const finalName = req.jabatanName ?? existing.jabatanName;
        if (req.jabatanLevel !== undefined && req.jabatanLevel !== existing.jabatanLevel) {
            const targetLevel = req.jabatanLevel;
            const currentLevel = existing.jabatanLevel;
            const updated = await prismaFlowly.$transaction(async (tx) => {
                const levels = await tx.jabatan.findMany({
                    where: { isDeleted: false },
                    orderBy: { jabatanLevel: "asc" },
                    select: { jabatanId: true, jabatanLevel: true }
                });
                const totalLevels = levels.length;
                if (totalLevels === 0) {
                    throw new ResponseError(400, "Jabatan levels not found");
                }
                const levelSet = new Set();
                let minLevel = Number.POSITIVE_INFINITY;
                let maxLevel = Number.NEGATIVE_INFINITY;
                for (const level of levels) {
                    if (levelSet.has(level.jabatanLevel)) {
                        throw new ResponseError(400, "Duplicate jabatan level detected");
                    }
                    levelSet.add(level.jabatanLevel);
                    if (level.jabatanLevel < minLevel)
                        minLevel = level.jabatanLevel;
                    if (level.jabatanLevel > maxLevel)
                        maxLevel = level.jabatanLevel;
                }
                if (minLevel !== 1 || maxLevel !== totalLevels) {
                    throw new ResponseError(400, "Jabatan levels must be sequential");
                }
                if (targetLevel < 1 || targetLevel > totalLevels) {
                    throw new ResponseError(400, "Jabatan level is out of range");
                }
                const now = new Date();
                if (targetLevel < currentLevel) {
                    await tx.jabatan.updateMany({
                        where: {
                            isDeleted: false,
                            jabatanLevel: {
                                gte: targetLevel,
                                lt: currentLevel
                            }
                        },
                        data: {
                            jabatanLevel: { increment: 1 },
                            updatedAt: now,
                            updatedBy: requesterId
                        }
                    });
                }
                else {
                    await tx.jabatan.updateMany({
                        where: {
                            isDeleted: false,
                            jabatanLevel: {
                                gt: currentLevel,
                                lte: targetLevel
                            }
                        },
                        data: {
                            jabatanLevel: { decrement: 1 },
                            updatedAt: now,
                            updatedBy: requesterId
                        }
                    });
                }
                return tx.jabatan.update({
                    where: { jabatanId: req.jabatanId },
                    data: {
                        jabatanName: finalName,
                        jabatanLevel: targetLevel,
                        jabatanDesc: finalDesc,
                        jabatanIsActive: finalIsActive,
                        updatedAt: now,
                        updatedBy: requesterId
                    }
                });
            });
            return toJabatanResponse(updated);
        }
        const updated = await prismaFlowly.jabatan.update({
            where: { jabatanId: req.jabatanId },
            data: {
                jabatanName: finalName,
                jabatanLevel: finalLevel,
                jabatanDesc: finalDesc,
                jabatanIsActive: finalIsActive,
                updatedAt: new Date(),
                updatedBy: requesterId
            }
        });
        return toJabatanResponse(updated);
    }
    /* ---------- DELETE ---------- */
    static async softDelete(requesterId, reqBody) {
        const req = Validation.validate(JabatanValidation.DELETE, reqBody);
        const requester = await prismaFlowly.user.findUnique({
            where: { userId: requesterId },
            include: { role: true }
        });
        if (!requester || requester.role.roleLevel !== 1) {
            throw new ResponseError(403, "Only admin can delete jabatan");
        }
        const existing = await prismaFlowly.jabatan.findUnique({
            where: { jabatanId: req.jabatanId }
        });
        if (!existing || existing.isDeleted) {
            throw new ResponseError(404, "Jabatan not found");
        }
        await prismaFlowly.jabatan.update({
            where: { jabatanId: req.jabatanId },
            data: {
                isDeleted: true,
                jabatanIsActive: false,
                deletedAt: new Date(),
                deletedBy: requesterId
            }
        });
        return { message: "Jabatan deleted" };
    }
    /* ---------- LIST ---------- */
    static async list() {
        const list = await prismaFlowly.jabatan.findMany({
            where: { isDeleted: false },
            orderBy: { createdAt: "desc" }
        });
        return list.map(toJabatanListResponse);
    }
}
//# sourceMappingURL=jabatan-service.js.map