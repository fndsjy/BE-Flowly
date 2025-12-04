// service/orgstructure-service.ts
import { prismaFlowly, prismaEmployee } from "../application/database.js";
import { Validation } from "../validation/validation.js";
import { PilarValidation } from "../validation/pilar-validation.js";
import { ResponseError } from "../error/response-error.js";
// import { generateOrgStructureId } from "../utils/id-generator.js";

import {
  type CreatePilarRequest,
  type UpdatePilarRequest,
  type DeletePilarRequest,
  toPilarResponse,
  toPilarListResponse
} from "../model/pilar-model.js";

export class PilarService {

  /* ------------------------------------------
   * CREATE
   * ------------------------------------------ */
  static async create(requesterId: string, reqBody: CreatePilarRequest) {
    const request = Validation.validate(PilarValidation.CREATE, reqBody);

    // Role check (only admin)
    const requester = await prismaFlowly.user.findUnique({
      where: { userId: requesterId },
      include: { role: true }
    });

    if (!requester || requester.role.roleLevel !== 1) {
      throw new ResponseError(403, "Only admin can create structure");
    }

    if (request.pic) {
      const picExists = await prismaEmployee.em_employee.findUnique({
        where: { UserId: request.pic }
      });

      if (!picExists) {
        throw new ResponseError(400, "PIC not found in employee table");
      }
    }

    // const structureId = await generateOrgStructureId();

    const pilar = await prismaEmployee.em_pilar.create({
      data: {
        pilar_name: request.pilarName,
        description: request.description ?? null,
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

    return toPilarResponse(pilar);
  }

  /* ------------------------------------------
   * UPDATE
   * ------------------------------------------ */
  static async update(requesterId: string, reqBody: UpdatePilarRequest) {
    const request = Validation.validate(PilarValidation.UPDATE, reqBody);

    const requester = await prismaFlowly.user.findUnique({
      where: { userId: requesterId },
      include: { role: true }
    });

    if (!requester || requester.role.roleLevel !== 1) {
      throw new ResponseError(403, "Only admin can update structure");
    }

    const exists = await prismaEmployee.em_pilar.findUnique({
      where: { id: request.id}
    });

    if (!exists) throw new ResponseError(404, "Pilar not found");

    if (request.pic) {
      const picExists = await prismaEmployee.em_employee.findUnique({
        where: { UserId: request.pic }
      });

      if (!picExists) {
        throw new ResponseError(400, "PIC not found in employee table");
      } 
    }

    const updated = await prismaEmployee.em_pilar.update({
      where: { id: request.id },
      data: {
        pilar_name: request.pilarName ?? exists.pilar_name,
        description: request.description ?? exists.description,
        status: request.status ?? exists.status,
        pic: request.pic ?? exists.pic,
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
  static async softDelete(requesterId: string, reqBody: DeletePilarRequest) {
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

    if (!exists) throw new ResponseError(404, "Pilar not found");

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
      orderBy: { createdAt: "desc" },
    });

    return pilars.map(toPilarListResponse);
  }
}
