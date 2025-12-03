// service/orgstructure-service.ts
import { prismaFlowly, prismaEmployee } from "../application/database.js";
import { Validation } from "../validation/validation.js";
import { PilarValidation } from "../validation/pilar-validation.js";
import { ResponseError } from "../error/response-error.js";
// import { generateOrgStructureId } from "../utils/id-generator.js";
import { toPilarResponse, toPilarListResponse } from "../model/pilar-model.js";
export class PilarService {
    /* ------------------------------------------
     * CREATE
     * ------------------------------------------ */
    static async create(requesterId, reqBody) {
        const request = Validation.validate(PilarValidation.CREATE, reqBody);
        // Role check (only admin)
        const requester = await prismaFlowly.user.findUnique({
            where: { userId: requesterId },
            include: { role: true }
        });
        if (!requester || requester.role.roleLevel !== 1) {
            throw new ResponseError(403, "Only admin can create structure");
        }
        // const structureId = await generateOrgStructureId();
        const pilar = await prismaEmployee.em_pilar.create({
            data: {
                pilar_name: request.pilarName,
                description: request.description ?? null,
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
        return toPilarResponse(pilar);
    }
    /* ------------------------------------------
     * UPDATE
     * ------------------------------------------ */
    static async update(requesterId, reqBody) {
        const request = Validation.validate(PilarValidation.UPDATE, reqBody);
        const requester = await prismaFlowly.user.findUnique({
            where: { userId: requesterId },
            include: { role: true }
        });
        if (!requester || requester.role.roleLevel !== 1) {
            throw new ResponseError(403, "Only admin can update structure");
        }
        const exists = await prismaEmployee.em_pilar.findUnique({
            where: { id: request.id }
        });
        if (!exists)
            throw new ResponseError(404, "Pilar not found");
        const updated = await prismaEmployee.em_pilar.update({
            where: { id: request.id },
            data: {
                pilar_name: request.pilarName ?? exists.pilar_name,
                description: request.description ?? exists.description,
                status: request.status ?? exists.status,
                lastupdate: new Date(),
                updatedAt: new Date(),
                updatedBy: requesterId
            }
        });
        return toPilarResponse(updated);
    }
    /* ------------------------------------------
     * SOFT DELETE
     * ------------------------------------------ */
    static async softDelete(requesterId, reqBody) {
        const request = Validation.validate(PilarValidation.DELETE, reqBody);
        const requester = await prismaFlowly.user.findUnique({
            where: { userId: requesterId },
            include: { role: true }
        });
        if (!requester || requester.role.roleLevel !== 1) {
            throw new ResponseError(403, "Only admin can delete pilar");
        }
        const exists = await prismaEmployee.em_pilar.findUnique({
            where: { id: request.id, OR: [
                    { isDeleted: false },
                    { isDeleted: null }
                ] }
        });
        if (!exists)
            throw new ResponseError(404, "Pilar not found");
        await prismaEmployee.em_pilar.update({
            where: { id: request.id },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
                deletedBy: requesterId
            }
        });
        return { message: "Pilar deleted" };
    }
    /* ------------------------------------------
     * LIST ALL ACTIVE STRUCTURES
     * ------------------------------------------ */
    static async list() {
        const pilars = await prismaEmployee.em_pilar.findMany({
            where: { OR: [
                    { isDeleted: false },
                    { isDeleted: null }
                ], status: "A" },
            orderBy: { createdAt: "desc" }
        });
        return pilars.map(toPilarListResponse);
    }
}
//# sourceMappingURL=pilar-service.js.map