import { prismaEmployee, prismaFlowly } from "../application/database.js";
import { Validation } from "../validation/validation.js";
import { CasePdcaValidation } from "../validation/case-pdca-validation.js";
import { ResponseError } from "../error/response-error.js";
import { generateCasePdcaItemId } from "../utils/id-generator.js";
import {
  buildChanges,
  pickSnapshot,
  resolveActorType,
  writeAuditLog,
} from "../utils/audit-log.js";
import {
  assertCaseCrud,
  assertCaseRead,
  ensureCaseNotClosed,
  resolveCaseAccess,
} from "../utils/case-access.js";
import type { Prisma } from "../generated/flowly/client.js";
import {
  type CreateCasePdcaItemRequest,
  type UpdateCasePdcaItemRequest,
  type DeleteCasePdcaItemRequest,
  toCasePdcaItemResponse,
  toCasePdcaItemListResponse,
} from "../model/case-pdca-model.js";

const PDCA_AUDIT_FIELDS = [
  "caseId",
  "itemNo",
  "planText",
  "doText",
  "doStartDate",
  "doEndDate",
  "checkText",
  "checkStartDate",
  "checkEndDate",
  "checkBy",
  "checkComment",
  "actText",
  "actStartDate",
  "actEndDate",
  "isActive",
  "isDeleted",
] as const;

const PDCA_PDC_FIELDS = [
  "itemNo",
  "planText",
  "doText",
  "doStartDate",
  "doEndDate",
  "checkText",
  "checkStartDate",
  "checkEndDate",
  "checkBy",
  "checkComment",
  "isActive",
] as const;

const PDCA_ACT_FIELDS = ["actText", "actStartDate", "actEndDate"] as const;
const PDCA_ALLOWED_CASE_TYPES = new Set(["PROBLEM", "PROJECT"]);

const getPdcaSnapshot = (record: Record<string, unknown>) =>
  pickSnapshot(record, PDCA_AUDIT_FIELDS as unknown as string[]);

const normalizeNullableText = (value?: string | null) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const parseDate = (value?: string | Date | null): Date | null => {
  if (value === undefined || value === null) return null;
  if (value instanceof Date) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new ResponseError(400, "Invalid date format");
  }
  return parsed;
};

const hasAnyField = (
  payload: Record<string, unknown>,
  fields: readonly string[]
) => fields.some((field) => payload[field] !== undefined);

const resolveEmployeePdcaAccess = async (
  caseId: string,
  employeeId: number
) => {
  const caseHeader = await prismaFlowly.caseHeader.findUnique({
    where: { caseId },
    select: {
      caseId: true,
      caseType: true,
      isDeleted: true,
      requesterEmployeeId: true,
    },
  });

  if (!caseHeader || caseHeader.isDeleted) {
    throw new ResponseError(404, "Case not found");
  }

  if (!PDCA_ALLOWED_CASE_TYPES.has(caseHeader.caseType)) {
    throw new ResponseError(400, "PDCA only available for PROBLEM/PROJECT case");
  }

  const departments = await prismaFlowly.caseDepartment.findMany({
    where: { caseId, isDeleted: false },
    select: { sbuSubId: true, assigneeEmployeeId: true },
  });

  if (departments.length === 0) {
    throw new ResponseError(404, "Case department not found");
  }

  const isRequester = caseHeader.requesterEmployeeId === employeeId;
  const isAssignee = departments.some(
    (dept) => dept.assigneeEmployeeId === employeeId
  );

  let isPic = false;
  if (!isAssignee) {
    const sbuSubIds = Array.from(
      new Set(departments.map((dept) => dept.sbuSubId))
    );

    if (sbuSubIds.length > 0) {
      const pic = await prismaEmployee.em_sbu_sub.findFirst({
        where: {
          id: { in: sbuSubIds },
          pic: employeeId,
          status: "A",
          OR: [{ isDeleted: false }, { isDeleted: null }],
        },
        select: { id: true },
      });
      isPic = Boolean(pic);
    }
  }

  const isDepartmentActor = isAssignee || isPic;

  if (!isRequester && !isDepartmentActor) {
    throw new ResponseError(403, "No access to case PDCA");
  }

  return {
    caseHeader,
    isRequester,
    isDepartmentActor,
  };
};

const ensureCasePdcaAccess = async (
  caseId: string,
  employeeId?: number
) => {
  const caseHeader = await prismaFlowly.caseHeader.findUnique({
    where: { caseId },
    select: { caseId: true, caseType: true, isDeleted: true },
  });

  if (!caseHeader || caseHeader.isDeleted) {
    throw new ResponseError(404, "Case not found");
  }

  if (!PDCA_ALLOWED_CASE_TYPES.has(caseHeader.caseType)) {
    throw new ResponseError(400, "PDCA only available for PROBLEM/PROJECT case");
  }

  if (employeeId !== undefined) {
    const departments = await prismaFlowly.caseDepartment.findMany({
      where: { caseId, isDeleted: false },
      select: { sbuSubId: true, assigneeEmployeeId: true },
    });

    if (departments.length === 0) {
      throw new ResponseError(404, "Case department not found");
    }

    const isAssignee = departments.some(
      (dept) => dept.assigneeEmployeeId === employeeId
    );
    if (isAssignee) return caseHeader;

    const sbuSubIds = Array.from(
      new Set(departments.map((dept) => dept.sbuSubId))
    );

    if (sbuSubIds.length > 0) {
      const pic = await prismaEmployee.em_sbu_sub.findFirst({
        where: {
          id: { in: sbuSubIds },
          pic: employeeId,
          status: "A",
          OR: [{ isDeleted: false }, { isDeleted: null }],
        },
        select: { id: true },
      });

      if (pic) return caseHeader;
    }

    throw new ResponseError(403, "No access to case PDCA");
  }

  return caseHeader;
};

const resolveNextItemNo = async (caseId: string) => {
  const last = await prismaFlowly.casePdcaItem.findFirst({
    where: { caseId },
    select: { itemNo: true },
    orderBy: { itemNo: "desc" },
  });
  return last ? last.itemNo + 1 : 1;
};

const ensureItemNoAvailable = async (
  caseId: string,
  itemNo: number,
  excludeId?: string
) => {
  const existing = await prismaFlowly.casePdcaItem.findFirst({
    where: {
      caseId,
      itemNo,
      isDeleted: false,
      ...(excludeId ? { casePdcaItemId: { not: excludeId } } : {}),
    },
    select: { casePdcaItemId: true },
  });

  if (existing) {
    throw new ResponseError(400, "PDCA item number already exists");
  }
};

export class CasePdcaService {
  static async create(requesterId: string, reqBody: CreateCasePdcaItemRequest) {
    const request = Validation.validate(CasePdcaValidation.CREATE, reqBody);

    const access = await resolveCaseAccess(requesterId);
    if (access.actorType === "FLOWLY") {
      assertCaseCrud(access);
      await ensureCasePdcaAccess(request.caseId);
    } else if (access.employeeId !== undefined) {
      const employeeAccess = await resolveEmployeePdcaAccess(
        request.caseId,
        access.employeeId
      );
        if (!employeeAccess.isDepartmentActor) {
          throw new ResponseError(
            403,
            "Only target department can create PDCA items"
          );
        }
      } else {
        await ensureCasePdcaAccess(request.caseId);
      }

    await ensureCaseNotClosed(request.caseId);

    const itemNo =
      request.itemNo !== undefined
        ? request.itemNo
        : await resolveNextItemNo(request.caseId);

    await ensureItemNoAvailable(request.caseId, itemNo);

    const createId = await generateCasePdcaItemId();
    const casePdcaItemId = createId();
    const now = new Date();

    const created = await prismaFlowly.casePdcaItem.create({
      data: {
        casePdcaItemId,
        caseId: request.caseId,
        itemNo,
        planText: normalizeNullableText(request.planText) ?? null,
        doText: normalizeNullableText(request.doText) ?? null,
        doStartDate: parseDate(request.doStartDate) ?? null,
        doEndDate: parseDate(request.doEndDate) ?? null,
        checkText: normalizeNullableText(request.checkText) ?? null,
        checkStartDate: parseDate(request.checkStartDate) ?? null,
        checkEndDate: parseDate(request.checkEndDate) ?? null,
        checkBy: normalizeNullableText(request.checkBy) ?? null,
        checkComment: normalizeNullableText(request.checkComment) ?? null,
        actText: normalizeNullableText(request.actText) ?? null,
        actStartDate: parseDate(request.actStartDate) ?? null,
        actEndDate: parseDate(request.actEndDate) ?? null,
        isActive: true,
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
        createdBy: requesterId,
        updatedBy: requesterId,
      },
    });

    await writeAuditLog({
      module: "CASE",
      entity: "CASE_PDCA_ITEM",
      entityId: created.casePdcaItemId,
      action: "CREATE",
      actorId: requesterId,
      actorType: access.actorType,
      snapshot: getPdcaSnapshot(created as unknown as Record<string, unknown>),
      meta: { caseId: created.caseId },
    });

    return toCasePdcaItemResponse(created);
  }

  static async update(requesterId: string, reqBody: UpdateCasePdcaItemRequest) {
    const request = Validation.validate(CasePdcaValidation.UPDATE, reqBody);

    const access = await resolveCaseAccess(requesterId);
    if (access.actorType === "FLOWLY") {
      assertCaseCrud(access);
    }

    const existing = await prismaFlowly.casePdcaItem.findUnique({
      where: { casePdcaItemId: request.casePdcaItemId },
    });

    if (!existing || existing.isDeleted) {
      throw new ResponseError(404, "Case PDCA item not found");
    }

    await ensureCaseNotClosed(existing.caseId);

    if (access.actorType === "EMPLOYEE" && access.employeeId !== undefined) {
      const employeeAccess = await resolveEmployeePdcaAccess(
        existing.caseId,
        access.employeeId
      );
      const hasPdcFields = hasAnyField(
        request as Record<string, unknown>,
        PDCA_PDC_FIELDS
      );
      const hasActFields = hasAnyField(
        request as Record<string, unknown>,
        PDCA_ACT_FIELDS
      );
        if (!employeeAccess.isDepartmentActor && hasPdcFields) {
          throw new ResponseError(403, "Only target department can update PDCA");
        }
        if (!employeeAccess.isDepartmentActor && hasActFields) {
          throw new ResponseError(403, "Only target department can update ACT");
        }
      }

    if (request.itemNo !== undefined && request.itemNo !== existing.itemNo) {
      await ensureItemNoAvailable(
        existing.caseId,
        request.itemNo,
        existing.casePdcaItemId
      );
    }

    const before = { ...existing } as Record<string, unknown>;
    const updateData: Prisma.CasePdcaItemUpdateInput = {
      itemNo: request.itemNo ?? existing.itemNo,
      isActive: request.isActive ?? existing.isActive,
      updatedAt: new Date(),
      updatedBy: requesterId,
    };

    if (request.planText !== undefined) {
      updateData.planText = normalizeNullableText(request.planText) ?? null;
    }
    if (request.doText !== undefined) {
      updateData.doText = normalizeNullableText(request.doText) ?? null;
    }
    if (request.doStartDate !== undefined) {
      updateData.doStartDate = parseDate(request.doStartDate);
    }
    if (request.doEndDate !== undefined) {
      updateData.doEndDate = parseDate(request.doEndDate);
    }
    if (request.checkText !== undefined) {
      updateData.checkText = normalizeNullableText(request.checkText) ?? null;
    }
    if (request.checkStartDate !== undefined) {
      updateData.checkStartDate = parseDate(request.checkStartDate);
    }
    if (request.checkEndDate !== undefined) {
      updateData.checkEndDate = parseDate(request.checkEndDate);
    }
    if (request.checkBy !== undefined) {
      updateData.checkBy = normalizeNullableText(request.checkBy) ?? null;
    }
    if (request.checkComment !== undefined) {
      updateData.checkComment = normalizeNullableText(request.checkComment) ?? null;
    }
    if (request.actText !== undefined) {
      updateData.actText = normalizeNullableText(request.actText) ?? null;
    }
    if (request.actStartDate !== undefined) {
      updateData.actStartDate = parseDate(request.actStartDate);
    }
    if (request.actEndDate !== undefined) {
      updateData.actEndDate = parseDate(request.actEndDate);
    }

    const updated = await prismaFlowly.casePdcaItem.update({
      where: { casePdcaItemId: request.casePdcaItemId },
      data: updateData,
    });

    const changes = buildChanges(
      before,
      updated as unknown as Record<string, unknown>,
      PDCA_AUDIT_FIELDS as unknown as string[]
    );

    if (changes.length > 0) {
      await writeAuditLog({
        module: "CASE",
        entity: "CASE_PDCA_ITEM",
        entityId: updated.casePdcaItemId,
        action: "UPDATE",
        actorId: requesterId,
        actorType: resolveActorType(requesterId),
        changes,
        meta: { caseId: updated.caseId },
      });
    }

    return toCasePdcaItemResponse(updated);
  }

  static async softDelete(
    requesterId: string,
    reqBody: DeleteCasePdcaItemRequest
  ) {
    const request = Validation.validate(CasePdcaValidation.DELETE, reqBody);

    const access = await resolveCaseAccess(requesterId);
    if (access.actorType === "FLOWLY") {
      assertCaseCrud(access);
    }

    const existing = await prismaFlowly.casePdcaItem.findUnique({
      where: { casePdcaItemId: request.casePdcaItemId },
    });

    if (!existing || existing.isDeleted) {
      throw new ResponseError(404, "Case PDCA item not found");
    }

    await ensureCaseNotClosed(existing.caseId);

    if (access.actorType === "EMPLOYEE" && access.employeeId !== undefined) {
      const employeeAccess = await resolveEmployeePdcaAccess(
        existing.caseId,
        access.employeeId
      );
      if (!employeeAccess.isDepartmentActor) {
        throw new ResponseError(
          403,
          "Only target department can delete PDCA items"
        );
      }
    }

    const now = new Date();
    const updated = await prismaFlowly.casePdcaItem.update({
      where: { casePdcaItemId: request.casePdcaItemId },
      data: {
        isDeleted: true,
        isActive: false,
        deletedAt: now,
        deletedBy: requesterId,
        updatedAt: now,
        updatedBy: requesterId,
      },
    });

    await writeAuditLog({
      module: "CASE",
      entity: "CASE_PDCA_ITEM",
      entityId: updated.casePdcaItemId,
      action: "DELETE",
      actorId: requesterId,
      actorType: resolveActorType(requesterId),
      snapshot: getPdcaSnapshot(updated as unknown as Record<string, unknown>),
      meta: { caseId: updated.caseId },
    });

    return { message: "Case PDCA item deleted" };
  }

  static async list(
    requesterId: string,
    filters?: {
      caseId?: string;
    }
  ) {
    const access = await resolveCaseAccess(requesterId);
    assertCaseRead(access);

    if (access.actorType === "EMPLOYEE" && access.employeeId !== undefined) {
      if (!filters?.caseId) {
        return [];
      }
      await resolveEmployeePdcaAccess(filters.caseId, access.employeeId);
    }

    const whereClause: Prisma.CasePdcaItemWhereInput = {
      isDeleted: false,
      ...(access.actorType === "FLOWLY" && !access.canCrud ? { isActive: true } : {}),
      ...(filters?.caseId ? { caseId: filters.caseId } : {}),
    };

    const list = await prismaFlowly.casePdcaItem.findMany({
      where: whereClause,
      orderBy: { itemNo: "asc" },
    });

    return list.map(toCasePdcaItemListResponse);
  }
}
