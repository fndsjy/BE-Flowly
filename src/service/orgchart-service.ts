import { prismaFlowly, prismaEmployee } from "../application/database.js";
import { Validation } from "../validation/validation.js";
import { OrgChartValidation } from "../validation/orgchart-validation.js";
import { ResponseError } from "../error/response-error.js";
import { generateOrgChartId } from "../utils/id-generator.js";

import type {
  CreateOrgChartRequest,
  UpdateOrgChartRequest,
  DeleteOrgChartRequest,
} from "../model/orgchart-model.js";

import {
  toOrgChartResponse,
  toOrgChartListResponse
} from "../model/orgchart-model.js";

export class OrgChartService {

  // 📌 CREATE
  static async create(requesterUserId: string, request: CreateOrgChartRequest) {
    const validated = Validation.validate(OrgChartValidation.CREATE, request);

    const { structureId, parentId, userId } = validated;

    // Validate structureId
    const structureExists = await prismaFlowly.orgStructure.findUnique({
      where: { structureId: validated.structureId, isDeleted: false }
    });
    if (!structureExists) throw new ResponseError(400, "Invalid structureId");

    if (parentId) {
    const parentNode = await prismaFlowly.orgChart.findUnique({
      where: { nodeId: parentId, isDeleted: false }
    });

    if (!parentNode) {
      throw new ResponseError(400, "Invalid parentId");
    }

    if (parentNode.structureId !== structureId) {
      throw new ResponseError(
        400,
        `Parent ${parentId} in ${parentNode.structureId}, not in ${structureId}`
      );
    }
  }

    // Validate parentId
    // if (validated.parentId) {
    //   const parentExists = await prismaFlowly.orgChart.findUnique({
    //     where: { nodeId: validated.parentId, isDeleted: false }
    //   });
    //   if (!parentExists) throw new ResponseError(400, "Invalid parentId");
    // }

    // Validate userId
    if (validated.userId) {
      const userExists = await prismaFlowly.user.findUnique({
        where: { userId: validated.userId, isDeleted: false }
      });
      if (!userExists) throw new ResponseError(400, "Invalid userId");
    }

    // Cek role requester
    const requester = await prismaFlowly.user.findUnique({
      where: { userId: requesterUserId },
      include: { role: true }
    });
    if (!requester || requester.role.roleLevel !== 1) {
      throw new ResponseError(403, "Only admin can create orgchart nodes");
    }

    const nodeId = await generateOrgChartId();

     // AUTO-INCREMENT orderIndex per parent / per structure
    const lastOrder = await prismaFlowly.orgChart.findFirst({
      where: {
        structureId: validated.structureId,
        parentId: validated.parentId ?? null,
        isDeleted: false
      },
      orderBy: { orderIndex: "desc" }
    });

    const nextOrderIndex = lastOrder ? lastOrder.orderIndex + 1 : 0;

    try {
      const node = await prismaFlowly.orgChart.create({
        data: {
          nodeId,
          ...validated,
          orderIndex: nextOrderIndex,
          createdBy: requesterUserId,
          updatedBy: requesterUserId,
          isDeleted: false,
        }
      });
      return toOrgChartResponse(node);
    } catch (e: any) {
      console.error("❌ Prisma Error:", e.meta);
      throw e;
    }
  }

  // UPDATE
  static async update(requesterUserId: string, request: UpdateOrgChartRequest) {
    const validated = Validation.validate(OrgChartValidation.UPDATE, request);

    const { nodeId, structureId, parentId, userId } = validated;

    /* --------------------------------------------
    * 1. CEK NODE EXIST
    * -------------------------------------------- */
    const existing = await prismaFlowly.orgChart.findUnique({
      where: { nodeId, isDeleted: false }
    });

    if (!existing) {
      throw new ResponseError(404, "OrgChart node not found");
    }

    /* --------------------------------------------
    * 2. CEK ADMIN
    * -------------------------------------------- */
    const requester = await prismaFlowly.user.findUnique({
      where: { userId: requesterUserId },
      include: { role: true }
    });
    if (!requester || requester.role.roleLevel !== 1) {
      throw new ResponseError(403, "Only admin can update orgchart nodes");
    }

    /* --------------------------------------------
    * 3. VALIDATE STRUCTURE (if changed)
    * -------------------------------------------- */
    let finalStructureId = structureId ?? existing.structureId;

    if (structureId && structureId !== existing.structureId) {
      const structureValid = await prismaFlowly.orgStructure.findUnique({
        where: { structureId, isDeleted: false }
      });
      if (!structureValid) {
        throw new ResponseError(400, "Invalid structureId");
      }
    }

    /* --------------------------------------------
    * 4. VALIDATE PARENT ID
    * -------------------------------------------- */
    let finalParentId = parentId ?? existing.parentId;

    if (finalParentId) {
      if (finalParentId === nodeId) {
        throw new ResponseError(400, "Node cannot be its own parent");
      }

      const parentNode = await prismaFlowly.orgChart.findUnique({
        where: { nodeId: finalParentId, isDeleted: false }
      });

      if (!parentNode) {
        throw new ResponseError(400, "Invalid parentId");
      }

      // Parent must be in same structure
      if (parentNode.structureId !== finalStructureId) {
        throw new ResponseError(
          400,
          "Parent belongs to different structure"
        );
      }

      // Prevent circular reference (node → child → parent)
      const childCheck = await prismaFlowly.orgChart.findMany({
        where: { parentId: nodeId, isDeleted: false }
      });

      for (const c of childCheck) {
        if (c.nodeId === finalParentId) {
          throw new ResponseError(400, "Invalid move: cannot set child as parent");
        }
      }
    }

    // BLOCK STRUCTURE CHANGE IF NODE HAS CHILDREN
    if (structureId && structureId !== existing.structureId) {
      const childExists = await prismaFlowly.orgChart.findFirst({
        where: { parentId: nodeId, isDeleted: false }
      });

      if (childExists) {
        throw new ResponseError(
          400,
          "Cannot change structure because this node still has children."
        );
      }
    }

    /* --------------------------------------------
    * 5. VALIDATE USER ID
    * -------------------------------------------- */
    if (userId) {
      const userExists = await prismaFlowly.user.findUnique({
        where: { userId, isDeleted: false }
      });
      if (!userExists) throw new ResponseError(400, "Invalid userId");
    }

    /* --------------------------------------------
    * 6. HANDLE STRUCTURE CHANGE → regenerate orderIndex
    * -------------------------------------------- */
    let finalOrderIndex = existing.orderIndex;

    if (structureId && structureId !== existing.structureId) {
      const lastOrder = await prismaFlowly.orgChart.findFirst({
        where: {
          structureId,
          parentId: finalParentId ?? null,
          isDeleted: false
        },
        orderBy: { orderIndex: "desc" }
      });
      finalOrderIndex = lastOrder ? lastOrder.orderIndex + 1 : 0;
    }

    /* --------------------------------------------
    * 7. UPDATE NODE
    * -------------------------------------------- */
    const updated = await prismaFlowly.orgChart.update({
      where: { nodeId },
      data: {
        ...validated,
        structureId: finalStructureId,
        parentId: finalParentId,
        orderIndex: finalOrderIndex,
        updatedBy: requesterUserId
      }
    });

    return toOrgChartResponse(updated);
  }

  static async softDelete(requesterUserId: string, request: DeleteOrgChartRequest) {
    const validated = Validation.validate(OrgChartValidation.DELETE, request);

    /* --------------------------------------------
    * 1. CEK ADMIN
    * -------------------------------------------- */
    const requester = await prismaFlowly.user.findUnique({
      where: { userId: requesterUserId },
      include: { role: true }
    });
    if (!requester || requester.role.roleLevel !== 1) {
      throw new ResponseError(403, "Only admin can delete orgchart nodes");
    }

    /* --------------------------------------------
    * 2. CEK NODE EXIST
    * -------------------------------------------- */
    const node = await prismaFlowly.orgChart.findUnique({
      where: { nodeId: validated.nodeId, isDeleted: false }
    });
    if (!node) {
      throw new ResponseError(404, "OrgChart node not found");
    }

    /* --------------------------------------------
    * 3. CEK APAKAH PUNYA CHILD
    * -------------------------------------------- */
    const child = await prismaFlowly.orgChart.findFirst({
      where: {
        parentId: validated.nodeId,
        isDeleted: false
      }
    });

    if (child) {
      throw new ResponseError(
        400,
        "Cannot delete node: this position still has subordinates (children). Move or delete all children first."
      );
    }

    /* --------------------------------------------
    * 4. OPTIONAL: CEK ROOT (parentId null)
    * -------------------------------------------- */
    // if (node.parentId === null) {
    //   throw new ResponseError(
    //     400,
    //     "Cannot delete root node. Assign a new root or move all nodes first."
    //   );
    // }

    /* --------------------------------------------
    * 5. SOFT DELETE
    * -------------------------------------------- */
    await prismaFlowly.orgChart.update({
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
    const nodes = await prismaFlowly.orgChart.findMany({
      where: { isDeleted: false },
      orderBy: { orderIndex: "asc" }
    });

    return nodes.map(toOrgChartListResponse);
  }

  // 📌 LIST BY STRUCTURE
  static async listByStructure(structureId: string) {
    // 1. VALIDATE STRUCTURE
    const structureExists = await prismaFlowly.orgStructure.findUnique({
      where: { structureId, isDeleted: false }
    });

    if (!structureExists) {
      throw new ResponseError(404, "Structure not found");
    }

    // 2. GET ALL NODES IN THIS STRUCTURE
    const nodes = await prismaFlowly.orgChart.findMany({
      where: {
        structureId,
        isDeleted: false
      },
      orderBy: [
        { parentId: "asc" },      // root first
        { orderIndex: "asc" }     // order inside each parent
      ]
    });

    // 3. MAP TO RESPONSE MODEL
    return nodes.map(toOrgChartListResponse);
  }
}
