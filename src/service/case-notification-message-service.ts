import { prismaFlowly } from "../application/database.js";
import { Validation } from "../validation/validation.js";
import { CaseNotificationMessageValidation } from "../validation/case-notification-message-validation.js";
import { ResponseError } from "../error/response-error.js";
import { generateCaseNotificationMessageId } from "../utils/id-generator.js";
import { getAccessContext } from "../utils/access-scope.js";
import {
  type CreateCaseNotificationMessageRequest,
  type UpdateCaseNotificationMessageRequest,
  type DeleteCaseNotificationMessageRequest,
  toCaseNotificationMessageResponse,
  toCaseNotificationMessageListResponse,
} from "../model/case-notification-message-model.js";

const normalizeRole = (value: string) => value.trim().toUpperCase();

const ensureAdminAccess = async (requesterId: string) => {
  const accessContext = await getAccessContext(requesterId);
  if (!accessContext.isAdmin) {
    throw new ResponseError(403, "Admin access required");
  }
};

const ensureCaseExists = async (caseId: string) => {
  const caseHeader = await prismaFlowly.caseHeader.findUnique({
    where: { caseId },
    select: { caseId: true, isDeleted: true },
  });

  if (!caseHeader || caseHeader.isDeleted) {
    throw new ResponseError(404, "Case not found");
  }
};

const ensureCaseDepartment = async (caseDepartmentId: string, caseId: string) => {
  const department = await prismaFlowly.caseDepartment.findUnique({
    where: { caseDepartmentId },
    select: { caseId: true, isDeleted: true },
  });

  if (!department || department.isDeleted) {
    throw new ResponseError(404, "Case department not found");
  }

  if (department.caseId !== caseId) {
    throw new ResponseError(400, "Case department does not belong to case");
  }
};

export class CaseNotificationMessageService {
  static async create(
    requesterId: string,
    reqBody: CreateCaseNotificationMessageRequest
  ) {
    const request = Validation.validate(
      CaseNotificationMessageValidation.CREATE,
      reqBody
    );

    await ensureAdminAccess(requesterId);
    await ensureCaseExists(request.caseId);

    if (request.caseDepartmentId) {
      await ensureCaseDepartment(request.caseDepartmentId, request.caseId);
    }

    const role = normalizeRole(request.role);
    const now = new Date();

    const existing = await (prismaFlowly as typeof prismaFlowly & {
      caseNotificationMessage: {
        findFirst: (args: any) => Promise<{
          caseNotificationMessageId: string;
        } | null>;
      };
    }).caseNotificationMessage.findFirst({
      where: {
        isDeleted: false,
        caseId: request.caseId,
        caseDepartmentId: request.caseDepartmentId ?? null,
        recipientEmployeeId: request.recipientEmployeeId,
        role,
      },
      select: { caseNotificationMessageId: true },
    });

    if (existing) {
      const updated = await (prismaFlowly as typeof prismaFlowly & {
        caseNotificationMessage: {
          update: (args: any) => Promise<any>;
        };
      }).caseNotificationMessage.update({
        where: { caseNotificationMessageId: existing.caseNotificationMessageId },
        data: {
          messageTemplate: request.messageTemplate,
          isActive: request.isActive ?? true,
          updatedAt: now,
          updatedBy: requesterId,
        },
      });

      return toCaseNotificationMessageResponse(updated);
    }

    const createId = await generateCaseNotificationMessageId();
    const created = await (prismaFlowly as typeof prismaFlowly & {
      caseNotificationMessage: {
        create: (args: any) => Promise<any>;
      };
    }).caseNotificationMessage.create({
      data: {
        caseNotificationMessageId: createId(),
        caseId: request.caseId,
        caseDepartmentId: request.caseDepartmentId ?? null,
        recipientEmployeeId: request.recipientEmployeeId,
        role,
        messageTemplate: request.messageTemplate,
        isActive: request.isActive ?? true,
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
        createdBy: requesterId,
        updatedBy: requesterId,
      },
    });

    return toCaseNotificationMessageResponse(created);
  }

  static async update(
    requesterId: string,
    reqBody: UpdateCaseNotificationMessageRequest
  ) {
    const request = Validation.validate(
      CaseNotificationMessageValidation.UPDATE,
      reqBody
    );

    await ensureAdminAccess(requesterId);

    const existing = await (prismaFlowly as typeof prismaFlowly & {
      caseNotificationMessage: {
        findUnique: (args: any) => Promise<any>;
      };
    }).caseNotificationMessage.findUnique({
      where: { caseNotificationMessageId: request.caseNotificationMessageId },
    });

    if (!existing || existing.isDeleted) {
      throw new ResponseError(404, "Notification message not found");
    }

    if (!existing.caseId) {
      throw new ResponseError(400, "Case ID is required");
    }

    const updated = await (prismaFlowly as typeof prismaFlowly & {
      caseNotificationMessage: {
        update: (args: any) => Promise<any>;
      };
    }).caseNotificationMessage.update({
      where: { caseNotificationMessageId: request.caseNotificationMessageId },
      data: {
        messageTemplate: request.messageTemplate ?? existing.messageTemplate,
        isActive: request.isActive ?? existing.isActive,
        updatedAt: new Date(),
        updatedBy: requesterId,
      },
    });

    return toCaseNotificationMessageResponse(updated);
  }

  static async softDelete(
    requesterId: string,
    reqBody: DeleteCaseNotificationMessageRequest
  ) {
    const request = Validation.validate(
      CaseNotificationMessageValidation.DELETE,
      reqBody
    );

    await ensureAdminAccess(requesterId);

    const existing = await (prismaFlowly as typeof prismaFlowly & {
      caseNotificationMessage: {
        findUnique: (args: any) => Promise<any>;
      };
    }).caseNotificationMessage.findUnique({
      where: { caseNotificationMessageId: request.caseNotificationMessageId },
    });

    if (!existing || existing.isDeleted) {
      throw new ResponseError(404, "Notification message not found");
    }

    if (!existing.caseId) {
      throw new ResponseError(400, "Case ID is required");
    }

    const now = new Date();
    const updated = await (prismaFlowly as typeof prismaFlowly & {
      caseNotificationMessage: {
        update: (args: any) => Promise<any>;
      };
    }).caseNotificationMessage.update({
      where: { caseNotificationMessageId: request.caseNotificationMessageId },
      data: {
        isDeleted: true,
        isActive: false,
        deletedAt: now,
        deletedBy: requesterId,
        updatedAt: now,
        updatedBy: requesterId,
      },
    });

    return toCaseNotificationMessageResponse(updated);
  }

  static async list(
    requesterId: string,
    filters?: {
      caseId?: string;
      caseDepartmentId?: string;
      recipientEmployeeId?: number;
      role?: string;
    }
  ) {
    await ensureAdminAccess(requesterId);
    if (filters?.caseId) {
      await ensureCaseExists(filters.caseId);
    }

    const where: Record<string, any> = {
      isDeleted: false,
      ...(filters?.caseId ? { caseId: filters.caseId } : {}),
      ...(filters?.caseDepartmentId
        ? { caseDepartmentId: filters.caseDepartmentId }
        : {}),
      ...(filters?.recipientEmployeeId !== undefined
        ? { recipientEmployeeId: filters.recipientEmployeeId }
        : {}),
      ...(filters?.role ? { role: normalizeRole(filters.role) } : {}),
    };

    const items = await (prismaFlowly as typeof prismaFlowly & {
      caseNotificationMessage: {
        findMany: (args: any) => Promise<any[]>;
      };
    }).caseNotificationMessage.findMany({
      where,
      orderBy: { updatedAt: "desc" },
    });

    return items.map(toCaseNotificationMessageListResponse);
  }
}
