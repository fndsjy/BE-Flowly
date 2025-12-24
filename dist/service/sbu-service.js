import { prismaEmployee, prismaFlowly } from "../application/database.js";
import { Validation } from "../validation/validation.js";
import { SbuValidation } from "../validation/sbu-validation.js";
import { ResponseError } from "../error/response-error.js";
import { toSbuResponse, toSbuListResponse } from "../model/sbu-model.js";
export class SbuService {
    /* ---------- CREATE ---------- */
    static async create(requesterId, reqBody) {
        const req = Validation.validate(SbuValidation.CREATE, reqBody);
        const requester = await prismaFlowly.user.findUnique({
            where: { userId: requesterId },
            include: { role: true }
        });
        if (!requester || requester.role.roleLevel !== 1) {
            throw new ResponseError(403, "Only admin can create SBU");
        }
        if (req.pic) {
            const picExists = await prismaEmployee.em_employee.findUnique({
                where: { UserId: req.pic }
            });
            if (!picExists)
                throw new ResponseError(400, "PIC not found");
        }
        // Cek Pilar
        const pilar = await prismaEmployee.em_pilar.findUnique({
            where: { id: req.sbuPilar, OR: [{ isDeleted: false }, { isDeleted: null }] }
        });
        if (!pilar)
            throw new ResponseError(400, "Invalid Pilar");
        // Cek duplikasi SBU Code
        const duplicate = await prismaEmployee.em_sbu.findFirst({
            where: {
                sbu_code: req.sbuCode,
                OR: [{ isDeleted: false }, { isDeleted: null }]
            }
        });
        if (duplicate) {
            throw new ResponseError(400, "SBU Code already exists");
        }
        const sbu = await prismaEmployee.em_sbu.create({
            data: {
                sbu_code: req.sbuCode,
                sbu_name: req.sbuName,
                sbu_pilar: req.sbuPilar,
                description: req.description ?? null,
                pic: req.pic ?? null,
                status: "A",
                isDeleted: false,
                created_at: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
                lastupdate: new Date(),
                createdBy: requesterId,
                updatedBy: requesterId,
            }
        });
        return toSbuResponse(sbu);
    }
    /* ---------- UPDATE ---------- */
    static async update(requesterId, reqBody) {
        const req = Validation.validate(SbuValidation.UPDATE, reqBody);
        const requester = await prismaFlowly.user.findUnique({
            where: { userId: requesterId },
            include: { role: true }
        });
        if (!requester || requester.role.roleLevel !== 1) {
            throw new ResponseError(403, "Only admin can update SBU");
        }
        const exists = await prismaEmployee.em_sbu.findFirst({
            where: { id: req.id }
        });
        if (!exists)
            throw new ResponseError(404, "SBU not found");
        if (req.pic) {
            const picExists = await prismaEmployee.em_employee.findUnique({
                where: { UserId: req.pic }
            });
            if (!picExists)
                throw new ResponseError(400, "PIC not found");
        }
        if (req.sbuPilar && req.sbuPilar !== exists.sbu_pilar) {
            throw new ResponseError(400, "Cannot change pilar of SBU");
        }
        // Jika user ingin ganti sbu_code, cek duplikasi
        if (req.sbuCode && req.sbuCode !== exists.sbu_code) {
            const duplicate = await prismaEmployee.em_sbu.findFirst({
                where: {
                    sbu_code: req.sbuCode,
                    id: { not: req.id }, // exclude ID sekarang
                    OR: [{ isDeleted: false }, { isDeleted: null }]
                }
            });
            if (duplicate) {
                throw new ResponseError(400, "SBU Code already exists");
            }
        }
        const updated = await prismaEmployee.em_sbu.update({
            where: { id_sbu_code: { id: req.id, sbu_code: exists.sbu_code } },
            data: {
                sbu_code: req.sbuCode ?? exists.sbu_code,
                sbu_name: req.sbuName ?? exists.sbu_name,
                sbu_pilar: req.sbuPilar ?? exists.sbu_pilar,
                description: req.description ?? exists.description,
                pic: req.pic ?? exists.pic,
                status: req.status ?? exists.status,
                updatedAt: new Date(),
                lastupdate: new Date(),
                updatedBy: requesterId
            }
        });
        return toSbuResponse(updated);
    }
    /* ---------- DELETE ---------- */
    static async softDelete(requesterId, reqBody) {
        const req = Validation.validate(SbuValidation.DELETE, reqBody);
        const requester = await prismaFlowly.user.findUnique({
            where: { userId: requesterId },
            include: { role: true }
        });
        if (!requester || requester.role.roleLevel !== 1) {
            throw new ResponseError(403, "Only admin can delete SBU");
        }
        const exists = await prismaEmployee.em_sbu.findFirst({
            where: { id: req.id, OR: [{ isDeleted: false }, { isDeleted: null }] }
        });
        if (!exists)
            throw new ResponseError(404, "SBU not found");
        await prismaEmployee.em_sbu.update({
            where: { id_sbu_code: { id: req.id, sbu_code: exists.sbu_code } },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
                deletedBy: requesterId
            }
        });
        return { message: "SBU deleted" };
    }
    /* ---------- LIST ---------- */
    static async list() {
        const list = await prismaEmployee.em_sbu.findMany({
            where: { OR: [{ isDeleted: false }, { isDeleted: null }], status: "A" },
            orderBy: { createdAt: "desc" }
        });
        return list.map(toSbuListResponse);
    }
    /* ---------- GET BY PILAR ---------- */
    static async getByPilar(pilarId) {
        // Cek apakah pilar masih aktif
        const pilar = await prismaEmployee.em_pilar.findUnique({
            where: { id: pilarId },
        });
        // Jika pilar tidak ada atau isDeleted true → return [] langsung
        if (!pilar || pilar.isDeleted === true) {
            return [];
        }
        const exists = await prismaEmployee.em_pilar.findUnique({
            where: { id: pilarId, OR: [{ isDeleted: false }, { isDeleted: null }] }
        });
        if (!exists)
            throw new ResponseError(404, "Pilar not found");
        const list = await prismaEmployee.em_sbu.findMany({
            where: {
                sbu_pilar: pilarId,
                OR: [{ isDeleted: false }, { isDeleted: null }]
            },
            orderBy: { createdAt: "desc" }
        });
        return list.map(toSbuListResponse);
    }
}
//# sourceMappingURL=sbu-service.js.map