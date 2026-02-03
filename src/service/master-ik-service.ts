import { prismaEmployee, prismaFlowly } from "../application/database.js";
import { Validation } from "../validation/validation.js";
import { MasterIkValidation } from "../validation/master-ik-validation.js";
import { ResponseError } from "../error/response-error.js";
import { generateMasterIkId, generateProcedureSopIkId } from "../utils/id-generator.js";
import { assertProcedureCrud, getProcedureAccess } from "../utils/procedure-access.js";
import { buildRevisionWhere, getBaseNumber, isRevisionNumber } from "../utils/procedure-utils.js";
import { buildChanges, pickSnapshot, writeAuditLog } from "../utils/audit-log.js";
import type { MasterIK, ProcedureSopIK, Prisma } from "../generated/flowly/client.js";

import {
  type CreateMasterIkRequest,
  type UpdateMasterIkRequest,
  type DeleteMasterIkRequest,
  type MasterIkSopInfo,
  toMasterIkResponse,
  toMasterIkListResponse,
} from "../model/master-ik-model.js";

const IK_AUDIT_FIELDS = [
  "ikName",
  "ikNumber",
  "effectiveDate",
  "ikContent",
  "dibuatOleh",
  "diketahuiOleh",
  "disetujuiOleh",
  "isActive",
  "isDeleted",
] as const;

const getIkAuditSnapshot = (record: Record<string, unknown>) =>
  pickSnapshot(record, IK_AUDIT_FIELDS as unknown as string[]);

const SOP_IK_AUDIT_FIELDS = ["sopId", "ikId", "isActive", "isDeleted"] as const;

const getSopIkSnapshot = (record: Record<string, unknown>) =>
  pickSnapshot(record, SOP_IK_AUDIT_FIELDS as unknown as string[]);

type MasterIkRecord = MasterIK & {
  dibuatOleh?: number | null;
  diketahuiOleh?: number | null;
  disetujuiOleh?: number | null;
};

type MasterIkCreateData = Prisma.MasterIKCreateInput & {
  dibuatOleh?: number | null;
  diketahuiOleh?: number | null;
  disetujuiOleh?: number | null;
};

type MasterIkUpdateData = Prisma.MasterIKUpdateInput & {
  dibuatOleh?: number | null;
  diketahuiOleh?: number | null;
  disetujuiOleh?: number | null;
};

const ensureEmployeeFieldsExist = async (
  fields: Array<{ key: string; value: number | null | undefined }>
) => {
  const ids = fields
    .map((field) => field.value)
    .filter((value): value is number => typeof value === "number");
  const uniqueIds = Array.from(new Set(ids));

  if (uniqueIds.length === 0) return;

  const employees = await prismaEmployee.em_employee.findMany({
    where: { UserId: { in: uniqueIds } },
    select: { UserId: true },
  });

  const existingIds = new Set(employees.map((employee) => employee.UserId));
  const missingFields = fields
    .filter(
      (field) => typeof field.value === "number" && !existingIds.has(field.value)
    )
    .map((field) => field.key);

  if (missingFields.length > 0) {
    throw new ResponseError(
      400,
      `Employee not found for: ${missingFields.join(", ")}`
    );
  }
};

const buildIkSopInfoMap = async (
  ikIds: string[],
  canCrud: boolean
): Promise<Map<string, MasterIkSopInfo[]>> => {
  const map = new Map<string, MasterIkSopInfo[]>();
  if (ikIds.length === 0) return map;

  const linkWhere: Prisma.ProcedureSopIKWhereInput = {
    ikId: { in: ikIds },
    isDeleted: false,
    ...(canCrud ? {} : { isActive: true }),
    sop: {
      isDeleted: false,
      ...(canCrud ? {} : { isActive: true }),
    },
  };

  const links = await prismaFlowly.procedureSopIK.findMany({
    where: linkWhere,
    select: {
      ikId: true,
      sop: {
        select: {
          sopId: true,
          sopName: true,
          sbuSubId: true,
        },
      },
    },
  });

  const sbuSubIds = Array.from(
    new Set(
      links
        .map((link) => link.sop?.sbuSubId)
        .filter((value): value is number => typeof value === "number")
    )
  );

  const sbuSubs = sbuSubIds.length === 0
    ? []
    : await prismaEmployee.em_sbu_sub.findMany({
      where: {
        id: { in: sbuSubIds },
        OR: [{ isDeleted: false }, { isDeleted: null }],
      },
      select: {
        id: true,
        sbu_sub_name: true,
      },
    });

  const sbuSubMap = new Map<number, string | null>(
    sbuSubs.map((sub) => [sub.id, sub.sbu_sub_name ?? null])
  );

  for (const link of links) {
    if (!link.sop) continue;
    const info: MasterIkSopInfo = {
      sopId: link.sop.sopId,
      sopName: link.sop.sopName,
      sbuSubId: link.sop.sbuSubId,
      sbuSubName: sbuSubMap.get(link.sop.sbuSubId) ?? null,
    };
    const existing = map.get(link.ikId);
    if (existing) {
      existing.push(info);
    } else {
      map.set(link.ikId, [info]);
    }
  }

  return map;
};

const normalizeSopIds = (sopIds: string[]) =>
  Array.from(
    new Set(sopIds.map((id) => id.trim()).filter((id) => id.length > 0))
  );

type SopLinkAuditPayload = {
  created: Array<{
    sopIkId: string;
    sopId: string;
    ikId: string;
    isActive: boolean;
    isDeleted: boolean;
  }>;
  reactivated: Array<{ before: Record<string, unknown>; after: Record<string, unknown> }>;
  deleted: Array<Record<string, unknown>>;
};

const syncIkSopLinks = async (
  ikId: string,
  sopIds: string[],
  requesterId: string,
  access: { actorType: "FLOWLY" | "EMPLOYEE" }
): Promise<SopLinkAuditPayload> => {
  const normalizedSopIds = normalizeSopIds(sopIds);
  const auditPayload: SopLinkAuditPayload = {
    created: [],
    reactivated: [],
    deleted: [],
  };

  const sops = normalizedSopIds.length > 0
    ? await prismaFlowly.procedureSop.findMany({
      where: {
        sopId: { in: normalizedSopIds },
        isDeleted: false,
      },
      select: { sopId: true, isActive: true },
    })
    : [];

  const sopMap = new Map(sops.map((sop) => [sop.sopId, sop]));
  const missingIds = normalizedSopIds.filter((id) => !sopMap.has(id));
  if (missingIds.length > 0) {
    throw new ResponseError(404, `SOP not found: ${missingIds.join(", ")}`);
  }

  const inactiveIds = sops.filter((sop) => !sop.isActive).map((sop) => sop.sopId);
  if (inactiveIds.length > 0) {
    throw new ResponseError(400, `SOP not active: ${inactiveIds.join(", ")}`);
  }

  const existingLinks = await prismaFlowly.procedureSopIK.findMany({
    where: { ikId },
  });

  const existingBySopId = new Map<string, ProcedureSopIK>();
  for (const link of existingLinks) {
    if (!existingBySopId.has(link.sopId)) {
      existingBySopId.set(link.sopId, link);
    }
  }

  const toCreate: string[] = [];
  const toReactivate: ProcedureSopIK[] = [];
  const toDelete: ProcedureSopIK[] = [];

  for (const sopId of normalizedSopIds) {
    const existing = existingBySopId.get(sopId);
    if (!existing) {
      toCreate.push(sopId);
      continue;
    }
    if (existing.isDeleted || !existing.isActive) {
      toReactivate.push(existing);
    }
  }

  for (const link of existingLinks) {
    if (!normalizedSopIds.includes(link.sopId) && !link.isDeleted) {
      toDelete.push(link);
    }
  }

  const now = new Date();
  const createId = await generateProcedureSopIkId();
  const createPayloads = toCreate.map((sopId) => ({
    sopIkId: createId(),
    sopId,
    ikId,
    isActive: true,
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
    createdBy: requesterId,
    updatedBy: requesterId,
  }));

  await prismaFlowly.$transaction(async (tx) => {
    if (toReactivate.length > 0) {
      await tx.procedureSopIK.updateMany({
        where: { sopIkId: { in: toReactivate.map((link) => link.sopIkId) } },
        data: {
          isDeleted: false,
          isActive: true,
          deletedAt: null,
          deletedBy: null,
          updatedAt: now,
          updatedBy: requesterId,
        },
      });
    }

    if (toDelete.length > 0) {
      await tx.procedureSopIK.updateMany({
        where: { sopIkId: { in: toDelete.map((link) => link.sopIkId) } },
        data: {
          isDeleted: true,
          isActive: false,
          deletedAt: now,
          deletedBy: requesterId,
          updatedAt: now,
          updatedBy: requesterId,
        },
      });
    }

    if (createPayloads.length > 0) {
      await tx.procedureSopIK.createMany({
        data: createPayloads,
      });
    }
  });

  auditPayload.created = createPayloads.map((payload) => ({
    sopIkId: payload.sopIkId,
    sopId: payload.sopId,
    ikId: payload.ikId,
    isActive: payload.isActive,
    isDeleted: payload.isDeleted,
  }));

  auditPayload.reactivated = toReactivate.map((link) => {
    const after = {
      ...link,
      isDeleted: false,
      isActive: true,
      deletedAt: null,
      deletedBy: null,
    } as Record<string, unknown>;
    return {
      before: link as unknown as Record<string, unknown>,
      after,
    };
  });

  auditPayload.deleted = toDelete.map((link) => link as unknown as Record<string, unknown>);

  return auditPayload;
};

const writeSopIkAuditLogs = async (
  audit: SopLinkAuditPayload,
  requesterId: string,
  actorType: "FLOWLY" | "EMPLOYEE"
) => {
  for (const payload of audit.created) {
    await writeAuditLog({
      module: "PROCEDURE",
      entity: "SOP_IK",
      entityId: payload.sopIkId,
      action: "CREATE",
      actorId: requesterId,
      actorType,
      snapshot: getSopIkSnapshot(payload as unknown as Record<string, unknown>),
      meta: { sopId: payload.sopId, ikId: payload.ikId },
    });
  }

  for (const change of audit.reactivated) {
    const changes = buildChanges(
      change.before,
      change.after,
      SOP_IK_AUDIT_FIELDS as unknown as string[]
    );
    if (changes.length > 0) {
      await writeAuditLog({
        module: "PROCEDURE",
        entity: "SOP_IK",
        entityId: String(change.before.sopIkId),
        action: "UPDATE",
        actorId: requesterId,
        actorType,
        changes,
        meta: { sopId: change.before.sopId, ikId: change.before.ikId },
      });
    }
  }

  for (const payload of audit.deleted) {
    await writeAuditLog({
      module: "PROCEDURE",
      entity: "SOP_IK",
      entityId: String(payload.sopIkId),
      action: "DELETE",
      actorId: requesterId,
      actorType,
      snapshot: getSopIkSnapshot(payload),
      meta: { sopId: payload.sopId, ikId: payload.ikId },
    });
  }
};

export class MasterIkService {
  static async create(requesterId: string, reqBody: CreateMasterIkRequest) {
    const request = Validation.validate(MasterIkValidation.CREATE, reqBody);

    const access = await getProcedureAccess(requesterId);
    assertProcedureCrud(access);

    await ensureEmployeeFieldsExist([
      { key: "dibuatOleh", value: request.dibuatOleh },
      { key: "diketahuiOleh", value: request.diketahuiOleh },
      { key: "disetujuiOleh", value: request.disetujuiOleh },
    ]);

    const baseNumber = getBaseNumber(request.ikNumber);
    const activeExisting = await prismaFlowly.masterIK.findFirst({
      where: {
        isDeleted: false,
        isActive: true,
        ...buildRevisionWhere("ikNumber", baseNumber),
      },
      orderBy: { effectiveDate: "desc" },
    });

    if (activeExisting && request.effectiveDate <= activeExisting.effectiveDate) {
      throw new ResponseError(400, "effectiveDate must be newer than active IK");
    }

    const ikId = await generateMasterIkId();
    const now = new Date();

    const { created, deactivatedIds } = await prismaFlowly.$transaction(async (tx) => {
      const toDeactivate = await tx.masterIK.findMany({
        where: {
          isDeleted: false,
          isActive: true,
          ...buildRevisionWhere("ikNumber", baseNumber),
        },
      });

      const ids = toDeactivate.map((item) => item.ikId);

      if (ids.length > 0) {
        await tx.masterIK.updateMany({
          where: { ikId: { in: ids } },
          data: {
            isActive: false,
            updatedAt: now,
            updatedBy: requesterId,
          },
        });
      }

      const createData: MasterIkCreateData = {
        ikId,
        ikName: request.ikName,
        ikNumber: request.ikNumber.trim(),
        effectiveDate: request.effectiveDate,
        ikContent: request.ikContent ?? null,
        dibuatOleh: request.dibuatOleh ?? null,
        diketahuiOleh: request.diketahuiOleh ?? null,
        disetujuiOleh: request.disetujuiOleh ?? null,
        isActive: true,
        isDeleted: false,
        createdBy: requesterId,
        updatedBy: requesterId,
      };

      const created = await tx.masterIK.create({ data: createData });

      return { created, deactivatedIds: ids };
    });

    if (deactivatedIds.length > 0) {
      await writeAuditLog({
        module: "PROCEDURE",
        entity: "IK",
        entityId: created.ikId,
        action: "AUTO_DEACTIVATE",
        actorId: requesterId,
        actorType: access.actorType,
        meta: {
          ikIds: deactivatedIds,
        },
      });
    }

    await writeAuditLog({
      module: "PROCEDURE",
      entity: "IK",
      entityId: created.ikId,
      action: "CREATE",
      actorId: requesterId,
      actorType: access.actorType,
      snapshot: getIkAuditSnapshot(created as unknown as Record<string, unknown>),
    });

    if (request.sopIds) {
      const auditPayload = await syncIkSopLinks(
        created.ikId,
        request.sopIds,
        requesterId,
        access
      );
      await writeSopIkAuditLogs(auditPayload, requesterId, access.actorType);
    }

    const sopMap = await buildIkSopInfoMap([created.ikId], access.canCrud);
    return toMasterIkResponse({
      ...created,
      sops: sopMap.get(created.ikId) ?? [],
    });
  }

  static async update(requesterId: string, reqBody: UpdateMasterIkRequest) {
    const request = Validation.validate(MasterIkValidation.UPDATE, reqBody);

    const access = await getProcedureAccess(requesterId);
    assertProcedureCrud(access);

    const existing = (await prismaFlowly.masterIK.findUnique({
      where: { ikId: request.ikId },
    })) as MasterIkRecord | null;

    if (!existing || existing.isDeleted) {
      throw new ResponseError(404, "IK not found");
    }

    await ensureEmployeeFieldsExist([
      { key: "dibuatOleh", value: request.dibuatOleh },
      { key: "diketahuiOleh", value: request.diketahuiOleh },
      { key: "disetujuiOleh", value: request.disetujuiOleh },
    ]);

    if (request.effectiveDate) {
      throw new ResponseError(400, "Use create to add new effective date");
    }

    const nextIkNumber = request.ikNumber?.trim();

    if (nextIkNumber && nextIkNumber !== existing.ikNumber) {
      if (isRevisionNumber(nextIkNumber, existing.ikNumber)) {
        throw new ResponseError(400, "Use create to revise IK number");
      }

      const baseNumber = getBaseNumber(nextIkNumber);
      const activeOther = await prismaFlowly.masterIK.findFirst({
        where: {
          ikId: { not: existing.ikId },
          isDeleted: false,
          isActive: true,
          ...buildRevisionWhere("ikNumber", baseNumber),
        },
      });

      if (activeOther) {
        throw new ResponseError(400, "Another active IK with this number exists");
      }
    }

    if (request.isActive === true && existing.isActive === false) {
      const baseNumber = getBaseNumber(existing.ikNumber);
      const activeOther = await prismaFlowly.masterIK.findFirst({
        where: {
          ikId: { not: existing.ikId },
          isDeleted: false,
          isActive: true,
          ...buildRevisionWhere("ikNumber", baseNumber),
        },
      });

      if (activeOther) {
        throw new ResponseError(400, "Deactivate other IK revisions first");
      }
    }

    const before = { ...existing } as Record<string, unknown>;

    const updateData: MasterIkUpdateData = {
      ikName: request.ikName ?? existing.ikName,
      ikNumber: nextIkNumber ?? existing.ikNumber,
      ikContent: request.ikContent === undefined ? existing.ikContent : request.ikContent,
      dibuatOleh: request.dibuatOleh === undefined ? existing.dibuatOleh : request.dibuatOleh,
      diketahuiOleh: request.diketahuiOleh === undefined ? existing.diketahuiOleh : request.diketahuiOleh,
      disetujuiOleh: request.disetujuiOleh === undefined ? existing.disetujuiOleh : request.disetujuiOleh,
      isActive: request.isActive ?? existing.isActive,
      updatedAt: new Date(),
      updatedBy: requesterId,
    };

    const updated = await prismaFlowly.masterIK.update({
      where: { ikId: request.ikId },
      data: updateData,
    });

    const changes = buildChanges(
      before,
      updated as unknown as Record<string, unknown>,
      IK_AUDIT_FIELDS as unknown as string[]
    );

    if (changes.length > 0) {
      await writeAuditLog({
        module: "PROCEDURE",
        entity: "IK",
        entityId: updated.ikId,
        action: "UPDATE",
        actorId: requesterId,
        actorType: access.actorType,
        changes,
      });
    }

    if (request.sopIds !== undefined) {
      const auditPayload = await syncIkSopLinks(
        updated.ikId,
        request.sopIds,
        requesterId,
        access
      );
      await writeSopIkAuditLogs(auditPayload, requesterId, access.actorType);
    }

    const sopMap = await buildIkSopInfoMap([updated.ikId], access.canCrud);
    return toMasterIkResponse({
      ...updated,
      sops: sopMap.get(updated.ikId) ?? [],
    });
  }

  static async softDelete(requesterId: string, reqBody: DeleteMasterIkRequest) {
    const request = Validation.validate(MasterIkValidation.DELETE, reqBody);

    const access = await getProcedureAccess(requesterId);
    assertProcedureCrud(access);

    const existing = await prismaFlowly.masterIK.findUnique({
      where: { ikId: request.ikId },
    });

    if (!existing || existing.isDeleted) {
      throw new ResponseError(404, "IK not found");
    }

    const now = new Date();

    const { linkDeletedCount } = await prismaFlowly.$transaction(async (tx) => {
      const linkResult = await tx.procedureSopIK.updateMany({
        where: { ikId: request.ikId, isDeleted: false },
        data: {
          isDeleted: true,
          isActive: false,
          deletedAt: now,
          deletedBy: requesterId,
        },
      });

      await tx.masterIK.update({
        where: { ikId: request.ikId },
        data: {
          isDeleted: true,
          isActive: false,
          deletedAt: now,
          deletedBy: requesterId,
        },
      });

      return { linkDeletedCount: linkResult.count };
    });

    const payload = {
      module: "PROCEDURE",
      entity: "IK",
      entityId: existing.ikId,
      action: "DELETE",
      actorId: requesterId,
      actorType: access.actorType,
      snapshot: getIkAuditSnapshot(existing as unknown as Record<string, unknown>),
    } as const;
    const meta = linkDeletedCount > 0 ? { linkCount: linkDeletedCount } : undefined;
    await writeAuditLog(meta ? { ...payload, meta } : payload);

    return { message: "IK deleted" };
  }

  static async list(
    requesterId: string,
    filters?: {
      sopId?: string;
    }
  ) {
    const access = await getProcedureAccess(requesterId);

    if (filters?.sopId) {
      const sop = await prismaFlowly.procedureSop.findUnique({
        where: { sopId: filters.sopId },
        select: { isDeleted: true, isActive: true },
      });
      if (!sop || sop.isDeleted || !sop.isActive) {
        return [];
      }
    }

    const whereClause: Record<string, unknown> = {
      isDeleted: false,
      ...(access.canCrud ? {} : { isActive: true }),
    };

    if (filters?.sopId) {
      const linkWhere = {
        sopId: filters.sopId,
        isDeleted: false,
        ...(access.canCrud ? {} : { isActive: true }),
      };
      Object.assign(whereClause, {
        sops: {
          some: linkWhere,
        },
      });
    }

    const list = await prismaFlowly.masterIK.findMany({
      where: whereClause,
      orderBy: { effectiveDate: "desc" },
    });

    const employeeIds = new Set<number>();
    for (const item of list) {
      if (typeof item.dibuatOleh === "number") employeeIds.add(item.dibuatOleh);
      if (typeof item.diketahuiOleh === "number") employeeIds.add(item.diketahuiOleh);
      if (typeof item.disetujuiOleh === "number") employeeIds.add(item.disetujuiOleh);
    }

    const employees = employeeIds.size === 0
      ? []
      : await prismaEmployee.em_employee.findMany({
        where: { UserId: { in: Array.from(employeeIds) } },
        select: { UserId: true, Name: true },
      });

    const employeeMap = new Map<number, string | null>(
      employees.map((employee) => [employee.UserId, employee.Name ?? null])
    );

    const sopMap = await buildIkSopInfoMap(
      list.map((item) => item.ikId),
      access.canCrud
    );

    return list.map((item) =>
      toMasterIkListResponse({
        ...item,
        dibuatOlehName:
          typeof item.dibuatOleh === "number"
            ? employeeMap.get(item.dibuatOleh) ?? null
            : null,
        diketahuiOlehName:
          typeof item.diketahuiOleh === "number"
            ? employeeMap.get(item.diketahuiOleh) ?? null
            : null,
        disetujuiOlehName:
          typeof item.disetujuiOleh === "number"
            ? employeeMap.get(item.disetujuiOleh) ?? null
            : null,
        sops: sopMap.get(item.ikId) ?? [],
      })
    );
  }
}
