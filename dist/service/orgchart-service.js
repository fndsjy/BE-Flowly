import { prismaClient } from "../application/database.js";
import { Validation } from "../validation/validation.js";
import { OrgChartValidation } from "../validation/orgchart-validation.js";
import { ResponseError } from "../error/response-error.js";
import { generateOrgChartId } from "../utils/id-generator.js";
import { toOrgChartResponse, toOrgChartListResponse } from "../model/orgchart-model.js";
export class OrgChartService {
    // 📌 CREATE
    static async create(requesterUserId, request) {
        const validated = Validation.validate(OrgChartValidation.CREATE, request);
        // Validate structureId
        const structureExists = await prismaClient.orgStructure.findUnique({
            where: { structureId: validated.structureId, isDeleted: false }
        });
        if (!structureExists)
            throw new ResponseError(400, "Invalid structureId");
        // Validate parentId
        if (validated.parentId) {
            const parentExists = await prismaClient.orgChart.findUnique({
                where: { nodeId: validated.parentId, isDeleted: false }
            });
            if (!parentExists)
                throw new ResponseError(400, "Invalid parentId");
        }
        // Validate userId
        if (validated.userId) {
            const userExists = await prismaClient.user.findUnique({
                where: { userId: validated.userId, isDeleted: false }
            });
            if (!userExists)
                throw new ResponseError(400, "Invalid userId");
        }
        // Cek role requester
        const requester = await prismaClient.user.findUnique({
            where: { userId: requesterUserId },
            include: { role: true }
        });
        if (!requester || requester.role.roleLevel !== 1) {
            throw new ResponseError(403, "Only admin can create orgchart nodes");
        }
        const nodeId = await generateOrgChartId();
        const node = await prismaClient.orgChart.create({
            data: {
                nodeId,
                ...validated,
                orderIndex: validated.orderIndex || 0,
                createdBy: requesterUserId,
                updatedBy: requesterUserId,
                isDeleted: false,
            }
        });
        return toOrgChartResponse(node);
    }
    // 📌 UPDATE
    static async update(requesterUserId, request) {
        const validated = Validation.validate(OrgChartValidation.UPDATE, request);
        const requester = await prismaClient.user.findUnique({
            where: { userId: requesterUserId },
            include: { role: true }
        });
        if (!requester || requester.role.roleLevel !== 1) {
            throw new ResponseError(403, "Only admin can update orgchart nodes");
        }
        const exists = await prismaClient.orgChart.findUnique({
            where: { nodeId: validated.nodeId, isDeleted: false }
        });
        if (!exists)
            throw new ResponseError(404, "OrgChart node not found");
        const node = await prismaClient.orgChart.update({
            where: { nodeId: validated.nodeId },
            data: {
                ...validated,
                updatedBy: requesterUserId,
            }
        });
        return toOrgChartResponse(node);
    }
    // 📌 DELETE
    static async softDelete(requesterUserId, request) {
        const validated = Validation.validate(OrgChartValidation.DELETE, request);
        const requester = await prismaClient.user.findUnique({
            where: { userId: requesterUserId },
            include: { role: true }
        });
        if (!requester || requester.role.roleLevel !== 1) {
            throw new ResponseError(403, "Only admin can delete orgchart nodes");
        }
        const exists = await prismaClient.orgChart.findUnique({
            where: { nodeId: validated.nodeId, isDeleted: false }
        });
        if (!exists)
            throw new ResponseError(404, "OrgChart node not found");
        await prismaClient.orgChart.update({
            where: { nodeId: validated.nodeId },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
                deletedBy: requesterUserId
            }
        });
        return { message: "Node deleted" };
    }
    // 📌 LIST (Tree / Flat)
    static async listTree() {
        const nodes = await prismaClient.orgChart.findMany({
            where: { isDeleted: false },
            orderBy: { orderIndex: "asc" }
        });
        return nodes.map(toOrgChartListResponse);
    }
}
//# sourceMappingURL=orgchart-service.js.map