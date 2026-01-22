// service/orgstructure-service.ts
import { prismaFlowly, prismaEmployee } from "../application/database.js";
import { Validation } from "../validation/validation.js";
import { PilarValidation } from "../validation/pilar-validation.js";
import { ResponseError } from "../error/response-error.js";
import { getAccessContext, getModuleAccessMap, canReadModule, canCrudModule, canCrud } from "../utils/access-scope.js";
import { buildChanges, pickSnapshot, resolveActorType, writeAuditLog } from "../utils/audit-log.js";
// import { generateOrgStructureId } from "../utils/id-generator.js";
import { toPilarResponse, toPilarListResponse } from "../model/pilar-model.js";
const PILAR_AUDIT_FIELDS = [
    "id",
    "pilarName",
    "description",
    "jobDesc",
    "jabatan",
    "pic",
    "status",
    "isDeleted",
];
const getPilarSnapshot = (record) => pickSnapshot(record, PILAR_AUDIT_FIELDS);
export class PilarService {
    /* ------------------------------------------
     * CREATE
     * ------------------------------------------ */
    static async create(requesterId, reqBody) {
        const request = Validation.validate(PilarValidation.CREATE, reqBody);
        const accessContext = await getAccessContext(requesterId);
        const moduleAccessMap = await getModuleAccessMap(requesterId);
        if (!accessContext.isAdmin && !canCrudModule(moduleAccessMap, "PILAR")) {
            throw new ResponseError(403, "Module PILAR access required");
        }
        if (request.pic) {
            const picExists = await prismaEmployee.em_employee.findUnique({
                where: { UserId: request.pic }
            });
            if (!picExists) {
                throw new ResponseError(400, "PIC not found in employee table");
            }
        }
        const normalizedJabatan = request.jabatan?.trim();
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
        // const structureId = await generateOrgStructureId();
        const pilar = await prismaEmployee.em_pilar.create({
            data: {
                pilar_name: request.pilarName,
                description: request.description ?? null,
                jobDesc: request.jobDesc ?? null,
                jabatan: jabatanId,
                status: "A",
                pic: request.pic ?? null,
                isDeleted: false,
                created_at: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
                lastupdate: new Date(),
                createdBy: requesterId,
                updatedBy: requesterId,
            }
        });
        const response = toPilarResponse(pilar);
        await writeAuditLog({
            module: "PILAR",
            entity: "PILAR",
            entityId: String(response.id),
            action: "CREATE",
            actorId: requesterId,
            actorType: resolveActorType(requesterId),
            snapshot: getPilarSnapshot(response),
        });
        return response;
    }
    /* ------------------------------------------
     * UPDATE
     * ------------------------------------------ */
    static async update(requesterId, reqBody) {
        const request = Validation.validate(PilarValidation.UPDATE, reqBody);
        const accessContext = await getAccessContext(requesterId);
        const moduleAccessMap = await getModuleAccessMap(requesterId);
        if (!accessContext.isAdmin && !canCrudModule(moduleAccessMap, "PILAR")) {
            throw new ResponseError(403, "Module PILAR access required");
        }
        if (!accessContext.isAdmin && !canCrud(accessContext.pilar, request.id)) {
            throw new ResponseError(403, "Pilar CRUD access required");
        }
        const exists = await prismaEmployee.em_pilar.findUnique({
            where: { id: request.id }
        });
        if (!exists)
            throw new ResponseError(404, "Pilar not found");
        if (request.pic) {
            const picExists = await prismaEmployee.em_employee.findUnique({
                where: { UserId: request.pic }
            });
            if (!picExists) {
                throw new ResponseError(400, "PIC not found in employee table");
            }
        }
        const finalJobDesc = request.jobDesc === undefined ? exists.jobDesc : request.jobDesc;
        const normalizedJabatanInput = request.jabatan === undefined
            ? undefined
            : request.jabatan?.trim() || null;
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
        const finalJabatan = normalizedJabatanInput === undefined
            ? exists.jabatan ?? null
            : normalizedJabatanInput;
        const updated = await prismaEmployee.em_pilar.update({
            where: { id: request.id },
            data: {
                pilar_name: request.pilarName ?? exists.pilar_name,
                description: request.description ?? exists.description,
                jobDesc: finalJobDesc,
                jabatan: finalJabatan,
                status: request.status ?? exists.status,
                pic: request.pic === undefined ? exists.pic : request.pic,
                lastupdate: new Date(),
                updatedAt: new Date(),
                updatedBy: requesterId
            }
        });
        const response = toPilarResponse(updated);
        const before = toPilarResponse(exists);
        const changes = buildChanges(before, response, PILAR_AUDIT_FIELDS);
        if (changes.length > 0) {
            await writeAuditLog({
                module: "PILAR",
                entity: "PILAR",
                entityId: String(response.id),
                action: "UPDATE",
                actorId: requesterId,
                actorType: resolveActorType(requesterId),
                changes,
            });
        }
        return response;
    }
    /* ------------------------------------------
     * SOFT DELETE
     * ------------------------------------------ */
    static async softDelete(requesterId, reqBody) {
        const request = Validation.validate(PilarValidation.DELETE, reqBody);
        const accessContext = await getAccessContext(requesterId);
        const moduleAccessMap = await getModuleAccessMap(requesterId);
        if (!accessContext.isAdmin && !canCrudModule(moduleAccessMap, "PILAR")) {
            throw new ResponseError(403, "Module PILAR access required");
        }
        if (!accessContext.isAdmin && !canCrud(accessContext.pilar, request.id)) {
            throw new ResponseError(403, "Pilar CRUD access required");
        }
        const exists = await prismaEmployee.em_pilar.findUnique({
            where: { id: request.id, OR: [
                    { isDeleted: false },
                    { isDeleted: null }
                ] }
        });
        if (!exists)
            throw new ResponseError(404, "Pilar not found");
        // Cek apakah ada SBU di bawah Pilar ini
        const sbuCount = await prismaEmployee.em_sbu.count({
            where: {
                sbu_pilar: request.id,
                OR: [{ isDeleted: false }, { isDeleted: null }]
            }
        });
        if (sbuCount > 0) {
            throw new ResponseError(400, "Cannot delete Pilar because it still has SBU");
        }
        await prismaEmployee.em_pilar.update({
            where: { id: request.id },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
                deletedBy: requesterId
            }
        });
        const snapshot = toPilarResponse(exists);
        await writeAuditLog({
            module: "PILAR",
            entity: "PILAR",
            entityId: String(snapshot.id),
            action: "DELETE",
            actorId: requesterId,
            actorType: resolveActorType(requesterId),
            snapshot: getPilarSnapshot(snapshot),
        });
        return { message: "Pilar deleted" };
    }
    /* ------------------------------------------
     * LIST ALL ACTIVE STRUCTURES
     * ------------------------------------------ */
    static async list(requesterId) {
        const accessContext = await getAccessContext(requesterId);
        const moduleAccessMap = await getModuleAccessMap(requesterId);
        if (!accessContext.isAdmin && !canReadModule(moduleAccessMap, "PILAR")) {
            throw new ResponseError(403, "Module PILAR access required");
        }
        if (!accessContext.isAdmin && accessContext.pilar.read.size === 0) {
            return [];
        }
        const pilars = await prismaEmployee.em_pilar.findMany({
            where: { OR: [
                    { isDeleted: false },
                    { isDeleted: null }
                ],
                status: "A",
                ...(accessContext.isAdmin
                    ? {}
                    : { id: { in: Array.from(accessContext.pilar.read) } })
            },
            orderBy: { createdAt: "desc" },
        });
        return pilars.map(toPilarListResponse);
    }
    /* ------------------------------------------
     * LIST ALL ACTIVE STRUCTURES (PUBLIC READ)
     * ------------------------------------------ */
    static async listPublic(_requesterId) {
        const pilars = await prismaEmployee.em_pilar.findMany({
            where: {
                OR: [{ isDeleted: false }, { isDeleted: null }],
                status: "A"
            },
            orderBy: { pilar_name: "asc" },
        });
        return pilars.map(toPilarListResponse);
    }
}
//# sourceMappingURL=pilar-service.js.map