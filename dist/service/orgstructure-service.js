// service/orgstructure-service.ts
import { prismaFlowly, prismaEmployee } from "../application/database.js";
import { Validation } from "../validation/validation.js";
import { OrgStructureValidation } from "../validation/orgstructure-validation.js";
import { ResponseError } from "../error/response-error.js";
import { generateOrgStructureId } from "../utils/id-generator.js";
import { toOrgStructureResponse, toOrgStructureListResponse } from "../model/orgstructure-model.js";
export class OrgStructureService {
    /* ------------------------------------------
     * CREATE
     * ------------------------------------------ */
    static async create(requesterId, reqBody) {
        const request = Validation.validate(OrgStructureValidation.CREATE, reqBody);
        // Role check (only admin)
        const requester = await prismaFlowly.user.findUnique({
            where: { userId: requesterId },
            include: { role: true }
        });
        if (!requester || requester.role.roleLevel !== 1) {
            throw new ResponseError(403, "Only admin can create structure");
        }
        const structureId = await generateOrgStructureId();
        const structure = await prismaFlowly.orgStructure.create({
            data: {
                structureId,
                name: request.name,
                description: request.description ?? null,
                createdBy: requesterId,
                updatedBy: requesterId
            }
        });
        return toOrgStructureResponse(structure);
    }
    /* ------------------------------------------
     * UPDATE
     * ------------------------------------------ */
    static async update(requesterId, reqBody) {
        const request = Validation.validate(OrgStructureValidation.UPDATE, reqBody);
        const requester = await prismaFlowly.user.findUnique({
            where: { userId: requesterId },
            include: { role: true }
        });
        if (!requester || requester.role.roleLevel !== 1) {
            throw new ResponseError(403, "Only admin can update structure");
        }
        const exists = await prismaFlowly.orgStructure.findUnique({
            where: { structureId: request.structureId, isDeleted: false }
        });
        if (!exists)
            throw new ResponseError(404, "Structure not found");
        const updated = await prismaFlowly.orgStructure.update({
            where: { structureId: request.structureId },
            data: {
                name: request.name ?? exists.name,
                description: request.description ?? exists.description,
                updatedBy: requesterId
            }
        });
        return toOrgStructureResponse(updated);
    }
    /* ------------------------------------------
     * SOFT DELETE
     * ------------------------------------------ */
    static async softDelete(requesterId, reqBody) {
        const request = Validation.validate(OrgStructureValidation.DELETE, reqBody);
        const requester = await prismaFlowly.user.findUnique({
            where: { userId: requesterId },
            include: { role: true }
        });
        if (!requester || requester.role.roleLevel !== 1) {
            throw new ResponseError(403, "Only admin can delete structure");
        }
        const exists = await prismaFlowly.orgStructure.findUnique({
            where: { structureId: request.structureId, isDeleted: false }
        });
        if (!exists)
            throw new ResponseError(404, "Structure not found");
        await prismaFlowly.orgStructure.update({
            where: { structureId: request.structureId },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
                deletedBy: requesterId
            }
        });
        return { message: "Structure deleted" };
    }
    /* ------------------------------------------
     * LIST ALL ACTIVE STRUCTURES
     * ------------------------------------------ */
    static async list() {
        const structures = await prismaFlowly.orgStructure.findMany({
            where: { isDeleted: false },
            orderBy: { createdAt: "desc" }
        });
        return structures.map(toOrgStructureListResponse);
    }
}
//# sourceMappingURL=orgstructure-service.js.map