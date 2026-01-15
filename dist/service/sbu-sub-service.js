// sbu-sub-service.ts
import { prismaEmployee, prismaFlowly } from "../application/database.js";
import { Validation } from "../validation/validation.js";
import { SbuSubValidation } from "../validation/sbu-sub-validation.js";
import { ResponseError } from "../error/response-error.js";
import { getAccessContext, canCrud } from "../utils/access-scope.js";
import { toSbuSubResponse, toSbuSubListResponse } from "../model/sbu-sub-model.js";
export class SbuSubService {
    /* ---------- CREATE ---------- */
    static async create(requesterId, reqBody) {
        const req = Validation.validate(SbuSubValidation.CREATE, reqBody);
        const accessContext = await getAccessContext(requesterId);
        if (!accessContext.isAdmin && !canCrud(accessContext.sbu, req.sbuId)) {
            throw new ResponseError(403, "Only admin can create SBU SUB");
        }
        // Cek Pilar
        // const pilar = await prismaEmployee.em_pilar.findUnique({
        //     where: { id: req.sbuPilar, OR: [{ isDeleted: false }, { isDeleted: null }] }
        // });
        // if (!pilar) throw new ResponseError(400, "Invalid Pilar");
        // Cek SBU
        const sbuExists = await prismaEmployee.em_sbu.findFirst({
            where: { id: req.sbuId, OR: [{ isDeleted: false }, { isDeleted: null }] }
        });
        if (!sbuExists)
            throw new ResponseError(400, "Invalid SBU");
        /* ---------------------- Ambil Pilar dari SBU ---------------------- */
        const pilarId = sbuExists.sbu_pilar;
        if (!pilarId) {
            throw new ResponseError(400, "SBU tidak memiliki pilar");
        }
        const pilar = await prismaEmployee.em_pilar.findFirst({
            where: { id: pilarId, OR: [{ isDeleted: false }, { isDeleted: null }] }
        });
        if (!pilar)
            throw new ResponseError(400, "Pilar pada SBU tidak ditemukan");
        // Cek PIC
        if (req.pic) {
            const picExists = await prismaEmployee.em_employee.findUnique({
                where: { UserId: req.pic }
            });
            if (!picExists)
                throw new ResponseError(400, "PIC not found");
        }
        const normalizedJabatan = req.jabatan?.trim();
        const jabatanId = normalizedJabatan ? normalizedJabatan : null;
        if (jabatanId) {
            const jabatan = await prismaFlowly.jabatan.findFirst({
                where: {
                    jabatanId,
                    isDeleted: false,
                    jabatanIsActive: true
                }
            });
            if (!jabatan) {
                throw new ResponseError(400, "Invalid jabatan");
            }
        }
        // Cek duplicate code
        const duplicate = await prismaEmployee.em_sbu_sub.findFirst({
            where: {
                sbu_sub_code: req.sbuSubCode,
                OR: [{ isDeleted: false }, { isDeleted: null }]
            }
        });
        if (duplicate)
            throw new ResponseError(400, "SBU SUB Code already exists");
        const created = await prismaEmployee.em_sbu_sub.create({
            data: {
                sbu_sub_code: req.sbuSubCode,
                sbu_sub_name: req.sbuSubName,
                sbu_id: req.sbuId,
                sbu_pilar: pilarId,
                description: req.description ?? null,
                jobDesc: req.jobDesc ?? null,
                jabatan: jabatanId,
                pic: req.pic ?? null,
                status: "A",
                isDeleted: false,
                created_at: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
                lastupdate: new Date(),
                createdBy: requesterId,
                updatedBy: requesterId
            }
        });
        return toSbuSubResponse(created);
    }
    /* ---------- UPDATE ---------- */
    static async update(requesterId, reqBody) {
        const req = Validation.validate(SbuSubValidation.UPDATE, reqBody);
        const accessContext = await getAccessContext(requesterId);
        const exists = await prismaEmployee.em_sbu_sub.findUnique({
            where: { id: req.id }
        });
        if (!exists)
            throw new ResponseError(404, "SBU SUB not found");
        if (!accessContext.isAdmin && !canCrud(accessContext.sbuSub, exists.id)) {
            throw new ResponseError(403, "Only admin can update SBU SUB");
        }
        // ❗ Tidak boleh update SBU parent
        if (req.sbuId && req.sbuId !== exists.sbu_id) {
            throw new ResponseError(400, "Cannot change SBU parent of SBU SUB");
        }
        // ❗ Tidak boleh update Pilar
        if (req.sbuPilar && req.sbuPilar !== exists.sbu_pilar) {
            throw new ResponseError(400, "Cannot change Pilar of SBU SUB");
        }
        // Cek PIC
        if (req.pic) {
            const picExists = await prismaEmployee.em_employee.findUnique({
                where: { UserId: req.pic }
            });
            if (!picExists)
                throw new ResponseError(400, "PIC not found");
        }
        const normalizedJabatanInput = req.jabatan === undefined
            ? undefined
            : req.jabatan?.trim() || null;
        if (normalizedJabatanInput) {
            const jabatan = await prismaFlowly.jabatan.findFirst({
                where: {
                    jabatanId: normalizedJabatanInput,
                    isDeleted: false,
                    jabatanIsActive: true
                }
            });
            if (!jabatan) {
                throw new ResponseError(400, "Invalid jabatan");
            }
        }
        // if (!req.sbuPilar) {
        //   throw new ResponseError(400, "sbuPilar is required");
        // }
        // Cek Pilar
        if (req.sbuPilar !== undefined && req.sbuPilar !== null) {
            const pilar = await prismaEmployee.em_pilar.findFirst({
                where: {
                    id: req.sbuPilar,
                    OR: [{ isDeleted: false }, { isDeleted: null }]
                }
            });
            if (!pilar)
                throw new ResponseError(400, "Invalid Pilar");
        }
        // Prevent change SBU unless logic allows
        if (req.sbuId && req.sbuId !== exists.sbu_id) {
            const sbuCheck = await prismaEmployee.em_sbu.findFirst({
                where: { id: req.sbuId, OR: [{ isDeleted: false }, { isDeleted: null }] }
            });
            if (!sbuCheck)
                throw new ResponseError(400, "Invalid new SBU");
        }
        // Cek duplicate code
        if (req.sbuSubCode && req.sbuSubCode !== exists.sbu_sub_code) {
            const duplicate = await prismaEmployee.em_sbu_sub.findFirst({
                where: {
                    sbu_sub_code: req.sbuSubCode,
                    id: { not: req.id },
                    OR: [{ isDeleted: false }, { isDeleted: null }]
                }
            });
            if (duplicate)
                throw new ResponseError(400, "SBU SUB Code already exists");
        }
        const finalJobDesc = req.jobDesc === undefined ? exists.jobDesc : req.jobDesc;
        const finalJabatan = normalizedJabatanInput === undefined
            ? exists.jabatan ?? null
            : normalizedJabatanInput;
        const updated = await prismaEmployee.em_sbu_sub.update({
            where: { id: req.id },
            data: {
                sbu_sub_code: req.sbuSubCode ?? exists.sbu_sub_code,
                sbu_sub_name: req.sbuSubName ?? exists.sbu_sub_name,
                sbu_id: req.sbuId ?? exists.sbu_id,
                sbu_pilar: req.sbuPilar ?? exists.sbu_pilar,
                description: req.description ?? exists.description,
                jobDesc: finalJobDesc,
                jabatan: finalJabatan,
                pic: req.pic ?? exists.pic,
                status: req.status ?? exists.status,
                updatedAt: new Date(),
                lastupdate: new Date(),
                updatedBy: requesterId,
            }
        });
        return toSbuSubResponse(updated);
    }
    /* ---------- DELETE ---------- */
    static async softDelete(requesterId, reqBody) {
        const req = Validation.validate(SbuSubValidation.DELETE, reqBody);
        const accessContext = await getAccessContext(requesterId);
        const exists = await prismaEmployee.em_sbu_sub.findFirst({
            where: { id: req.id, OR: [{ isDeleted: false }, { isDeleted: null }] }
        });
        if (!exists)
            throw new ResponseError(404, "SBU SUB not found");
        if (!accessContext.isAdmin && !canCrud(accessContext.sbuSub, exists.id)) {
            throw new ResponseError(403, "Only admin can delete SBU SUB");
        }
        await prismaEmployee.em_sbu_sub.update({
            where: { id: req.id },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
                deletedBy: requesterId
            }
        });
        return { message: "SBU SUB deleted" };
    }
    /* ---------- LIST ALL ---------- */
    static async list(requesterId) {
        const accessContext = await getAccessContext(requesterId);
        if (!accessContext.isAdmin && accessContext.sbuSub.read.size === 0) {
            return [];
        }
        const list = await prismaEmployee.em_sbu_sub.findMany({
            where: {
                OR: [{ isDeleted: false }, { isDeleted: null }],
                status: "A",
                ...(accessContext.isAdmin
                    ? {}
                    : { id: { in: Array.from(accessContext.sbuSub.read) } })
            },
            orderBy: { createdAt: "desc" }
        });
        return list.map(toSbuSubListResponse);
    }
    /* ---------- GET BY SBU ---------- */
    static async getBySbu(requesterId, sbuId) {
        const accessContext = await getAccessContext(requesterId);
        if (!accessContext.isAdmin && accessContext.sbuSub.read.size === 0) {
            return [];
        }
        // Cek apakah sbu masih aktif
        const sbu = await prismaEmployee.em_sbu.findFirst({
            where: { id: sbuId },
        });
        // Jika sbu tidak ada atau isDeleted true → return [] langsung
        if (!sbu || sbu.isDeleted === true) {
            return [];
        }
        const exists = await prismaEmployee.em_sbu.findFirst({
            where: { id: sbuId, OR: [{ isDeleted: false }, { isDeleted: null }] }
        });
        if (!exists)
            throw new ResponseError(404, "SBU not found");
        const list = await prismaEmployee.em_sbu_sub.findMany({
            where: {
                sbu_id: sbuId,
                OR: [{ isDeleted: false }, { isDeleted: null }],
                ...(accessContext.isAdmin
                    ? {}
                    : { id: { in: Array.from(accessContext.sbuSub.read) } })
            },
            orderBy: { createdAt: "desc" }
        });
        return list.map(toSbuSubListResponse);
    }
    /* ---------- GET BY PILAR ---------- */
    static async getByPilar(requesterId, pilarId) {
        const accessContext = await getAccessContext(requesterId);
        if (!accessContext.isAdmin && accessContext.sbuSub.read.size === 0) {
            return [];
        }
        // Cek apakah pilar masih aktif
        const pilar = await prismaEmployee.em_pilar.findUnique({
            where: { id: pilarId },
        });
        // Jika pilar tidak ada atau isDeleted true → return [] langsung
        if (!pilar || pilar.isDeleted === true) {
            return [];
        }
        const exists = await prismaEmployee.em_pilar.findFirst({
            where: { id: pilarId, OR: [{ isDeleted: false }, { isDeleted: null }] }
        });
        if (!exists)
            throw new ResponseError(404, "Pilar not found");
        const list = await prismaEmployee.em_sbu_sub.findMany({
            where: {
                sbu_pilar: pilarId,
                OR: [{ isDeleted: false }, { isDeleted: null }],
                ...(accessContext.isAdmin
                    ? {}
                    : { id: { in: Array.from(accessContext.sbuSub.read) } })
            },
            orderBy: { createdAt: "desc" }
        });
        return list.map(toSbuSubListResponse);
    }
}
//# sourceMappingURL=sbu-sub-service.js.map