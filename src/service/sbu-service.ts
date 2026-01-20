import { prismaEmployee, prismaFlowly } from "../application/database.js";
import { Validation } from "../validation/validation.js";
import { SbuValidation } from "../validation/sbu-validation.js";
import { ResponseError } from "../error/response-error.js";
import {
  getAccessContext,
  getModuleAccessMap,
  canReadModule,
  canCrudModule
} from "../utils/access-scope.js";

import {
  type CreateSbuRequest,
  type UpdateSbuRequest,
  type DeleteSbuRequest,
  toSbuResponse,
  toSbuListResponse
} from "../model/sbu-model.js";

type ExplicitAccessLevel = "READ" | "CRUD" | "NONE" | null;

const normalizeAccessLevel = (value: string): "READ" | "CRUD" | null => {
  const upper = value.trim().toUpperCase();
  if (upper === "FULL") {
    return "CRUD";
  }
  if (upper === "READ" || upper === "CRUD") {
    return upper;
  }
  return null;
};

const resolveExplicitSbuAccess = async (
  requesterId: string,
  sbuId: number
): Promise<ExplicitAccessLevel> => {
  const user = await prismaFlowly.user.findUnique({
    where: { userId: requesterId },
    select: { roleId: true }
  });

  const filters = [{ subjectType: "USER", subjectId: requesterId }];
  if (user?.roleId) {
    filters.unshift({ subjectType: "ROLE", subjectId: user.roleId });
  }

  const accessRoles = await prismaFlowly.accessRole.findMany({
    where: {
      isDeleted: false,
      resourceType: "SBU",
      resourceKey: String(sbuId),
      OR: filters
    },
    select: {
      subjectType: true,
      accessLevel: true,
      isActive: true
    }
  });

  const userEntry = accessRoles.find((entry) => entry.subjectType === "USER");
  if (userEntry) {
    if (!userEntry.isActive) {
      return "NONE";
    }
    return normalizeAccessLevel(userEntry.accessLevel);
  }

  const roleEntries = accessRoles.filter(
    (entry) => entry.subjectType === "ROLE" && entry.isActive
  );
  if (roleEntries.some((entry) => normalizeAccessLevel(entry.accessLevel) === "CRUD")) {
    return "CRUD";
  }
  if (roleEntries.some((entry) => normalizeAccessLevel(entry.accessLevel) === "READ")) {
    return "READ";
  }
  return null;
};

export class SbuService {

  /* ---------- CREATE ---------- */
  static async create(requesterId: string, reqBody: CreateSbuRequest) {
    const req = Validation.validate(SbuValidation.CREATE, reqBody);

    const accessContext = await getAccessContext(requesterId);
    const moduleAccessMap = await getModuleAccessMap(requesterId);
    if (!accessContext.isAdmin && !canCrudModule(moduleAccessMap, "SBU")) {
      throw new ResponseError(403, "Module SBU access required");
    }

    if (req.pic !== undefined && req.pic !== null) {
      const picExists = await prismaEmployee.em_employee.findUnique({
        where: { UserId: req.pic }
      });
      if (!picExists) throw new ResponseError(400, "PIC not found");
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

    // Cek Pilar
    const pilar = await prismaEmployee.em_pilar.findUnique({
        where: { id: req.sbuPilar, OR: [{ isDeleted: false }, { isDeleted: null }] }
    });

    if (!pilar) throw new ResponseError(400, "Invalid Pilar");

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
        updatedBy: requesterId,
      }
    });

    return toSbuResponse(sbu);
  }

  /* ---------- UPDATE ---------- */
  static async update(requesterId: string, reqBody: UpdateSbuRequest) {
    const req = Validation.validate(SbuValidation.UPDATE, reqBody);

    const accessContext = await getAccessContext(requesterId);
    const moduleAccessMap = await getModuleAccessMap(requesterId);

    const exists = await prismaEmployee.em_sbu.findFirst({
      where: { id: req.id }
    });

    if (!exists) throw new ResponseError(404, "SBU not found");
    if (!accessContext.isAdmin && !canCrudModule(moduleAccessMap, "SBU")) {
      throw new ResponseError(403, "Module SBU access required");
    }
    if (!accessContext.isAdmin) {
      const explicitAccess = await resolveExplicitSbuAccess(requesterId, exists.id);
      if (explicitAccess === "READ" || explicitAccess === "NONE") {
        throw new ResponseError(403, "SBU is read-only");
      }
    }

    if (req.pic !== undefined && req.pic !== null) {
      const picExists = await prismaEmployee.em_employee.findUnique({
        where: { UserId: req.pic }
      });
      if (!picExists) throw new ResponseError(400, "PIC not found");
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

    const finalJabatan = normalizedJabatanInput === undefined
      ? exists.jabatan ?? null
      : normalizedJabatanInput;

    const updated = await prismaEmployee.em_sbu.update({
      where: { id_sbu_code: { id: req.id, sbu_code: exists.sbu_code } },
      data: {
        sbu_code: req.sbuCode ?? exists.sbu_code,
        sbu_name: req.sbuName ?? exists.sbu_name,
        sbu_pilar: req.sbuPilar ?? exists.sbu_pilar,
        description: req.description ?? exists.description,
        jobDesc: req.jobDesc ?? exists.jobDesc,
        jabatan: finalJabatan,
        pic: req.pic === undefined ? exists.pic : req.pic,
        status: req.status ?? exists.status,
        updatedAt: new Date(),
        lastupdate: new Date(),
        updatedBy: requesterId
      }
    });

    return toSbuResponse(updated);
  }

  /* ---------- DELETE ---------- */
  static async softDelete(requesterId: string, reqBody: DeleteSbuRequest) {
    const req = Validation.validate(SbuValidation.DELETE, reqBody);

    const accessContext = await getAccessContext(requesterId);
    const moduleAccessMap = await getModuleAccessMap(requesterId);

    const exists = await prismaEmployee.em_sbu.findFirst({
      where: { id: req.id, OR: [{ isDeleted: false }, { isDeleted: null }] }
    });

    if (!exists) throw new ResponseError(404, "SBU not found");
    if (!accessContext.isAdmin && !canCrudModule(moduleAccessMap, "SBU")) {
      throw new ResponseError(403, "Module SBU access required");
    }
    if (!accessContext.isAdmin) {
      const explicitAccess = await resolveExplicitSbuAccess(requesterId, exists.id);
      if (explicitAccess === "READ" || explicitAccess === "NONE") {
        throw new ResponseError(403, "SBU is read-only");
      }
    }

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
  static async list(requesterId: string) {
    const accessContext = await getAccessContext(requesterId);
    const moduleAccessMap = await getModuleAccessMap(requesterId);
    if (!accessContext.isAdmin && !canReadModule(moduleAccessMap, "SBU")) {
      throw new ResponseError(403, "Module SBU access required");
    }
    if (!accessContext.isAdmin && accessContext.sbu.read.size === 0) {
      return [];
    }

    const list = await prismaEmployee.em_sbu.findMany({
      where: {
        OR: [{ isDeleted: false }, { isDeleted: null }],
        status: "A",
        ...(accessContext.isAdmin
          ? {}
          : { id: { in: Array.from(accessContext.sbu.read) } })
      },
      orderBy: { createdAt: "desc" }
    });

    return list.map(toSbuListResponse);
  }

    /* ---------- GET BY PILAR ---------- */
    static async getByPilar(requesterId: string, pilarId: number) {
      const accessContext = await getAccessContext(requesterId);
      const moduleAccessMap = await getModuleAccessMap(requesterId);
      if (!accessContext.isAdmin && !canReadModule(moduleAccessMap, "SBU")) {
        throw new ResponseError(403, "Module SBU access required");
      }
      if (!accessContext.isAdmin && accessContext.sbu.read.size === 0) {
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

        const exists = await prismaEmployee.em_pilar.findUnique({
            where: { id: pilarId, OR: [{ isDeleted: false }, { isDeleted: null }]}
        });

        if (!exists) throw new ResponseError(404, "Pilar not found");

        const list = await prismaEmployee.em_sbu.findMany({
          where: {
            sbu_pilar: pilarId,
            OR: [{ isDeleted: false }, { isDeleted: null }],
            ...(accessContext.isAdmin
              ? {}
              : { id: { in: Array.from(accessContext.sbu.read) } })
          },
          orderBy: { createdAt: "desc" }
        });

        return list.map(toSbuListResponse);
    }
}
