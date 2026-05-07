import { prismaEmployee, prismaFlowly } from "../application/database.js";
import { Validation } from "../validation/validation.js";
import { NotificationTemplateValidation } from "../validation/notification-template-validation.js";
import { ResponseError } from "../error/response-error.js";
import {
  generateNotificationTemplateId,
  generateNotificationTemplatePortalId,
  generateNotificationOutboxId,
} from "../utils/id-generator.js";
import { getAccessContext } from "../utils/access-scope.js";
import { dispatchGenericNotificationOutboxItem } from "./generic-notification-dispatcher.js";
import {
  type CreateNotificationTemplateRequest,
  type DeleteNotificationTemplateRequest,
  type TestNotificationRecipientResult,
  type TestWhatsappNotificationResponse,
  type UpdateNotificationTemplateRequest,
  toNotificationTemplateListResponse,
  toNotificationTemplateResponse,
} from "../model/notification-template-model.js";

const CHANNEL_WHATSAPP = "WHATSAPP";
const EMPLOYEE_REFERENCE_TYPE = "EMPLOYEE";
const TEST_PORTAL_KEY = "ADMINISTRATOR";
const TEST_EVENT_KEY = "WA_SERVICE_TEST";
const TEST_RECIPIENT_ROLE = "EXAM_MONITOR";
const TEST_CONTEXT_REFERENCE_TYPE = "WHATSAPP_SERVICE_TEST";

const normalizeUpper = (value: string) => value.trim().toUpperCase();

const normalizeOptionalText = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
};

const normalizePhone = (value?: string | null) => {
  if (!value) return null;
  const digits = value.replace(/\D+/g, "");
  return digits.length > 0 ? digits : null;
};

const normalizePortalKeys = (values?: string[] | null) =>
  [...new Set((values ?? []).map((value) => normalizeUpper(value)).filter(Boolean))].sort();

const parseConfiguredTestRecipientIds = () =>
  Array.from(
    new Set(
      (
        process.env.ONBOARDING_EXAM_MONITOR_USER_IDS ??
        process.env.ONBOARDING_EXAM_MONITOR_USER_ID ??
        ""
      )
        .split(",")
        .map((value) => Number(value.trim()))
        .filter((value) => Number.isInteger(value) && value > 0)
    )
  );

const formatDateTimeForNotification = (value: Date) =>
  value.toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const trimMessage = (value: string) => value.trim().slice(0, 1000);

const buildErrorMessage = (value: unknown) => {
  if (!value) return "Unknown error";
  if (value instanceof Error) return value.message;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const ensureAdminAccess = async (requesterId: string) => {
  const accessContext = await getAccessContext(requesterId);
  if (!accessContext.isAdmin) {
    throw new ResponseError(403, "Admin access required");
  }
};

const buildWhatsappTestMessage = (params: {
  employeeName: string;
  userId: number;
  sentAtText: string;
}) =>
  trimMessage(
    [
      "Tes notifikasi WA.",
      "",
      `Halo ${params.employeeName}, pesan ini dikirim untuk memastikan service WhatsApp aktif.`,
      `User ID: ${params.userId}`,
      `Waktu: ${params.sentAtText}`,
    ].join("\n")
  );

const toPortalScopeKey = (portalKeys: string[]) =>
  portalKeys.length === 0 ? "__ALL_PORTALS__" : portalKeys.join("|");

const matchesPortalScope = (
  item: {
    notificationTemplateId: string;
    portalMappings?: Array<{
      portalKey: string;
      isDeleted?: boolean;
    }> | null;
  },
  portalKeys: string[]
) => {
  const itemPortalKeys = normalizePortalKeys(
    (item.portalMappings ?? [])
      .filter((mapping) => !mapping.isDeleted)
      .map((mapping) => mapping.portalKey)
  );

  return toPortalScopeKey(itemPortalKeys) === toPortalScopeKey(portalKeys);
};

const prismaNotificationTemplate = () =>
  (prismaFlowly as typeof prismaFlowly & {
    notificationTemplate: {
      findMany: (args: any) => Promise<any[]>;
      findUnique: (args: any) => Promise<any>;
      create: (args: any) => Promise<any>;
      update: (args: any) => Promise<any>;
    };
    notificationTemplatePortal: {
      updateMany: (args: any) => Promise<any>;
      create: (args: any) => Promise<any>;
    };
    $transaction: <T>(fn: (tx: any) => Promise<T>) => Promise<T>;
  });

const notificationTemplateInclude = {
  portalMappings: {
    where: { isDeleted: false },
    orderBy: { portalKey: "asc" },
  },
} as const;

export class NotificationTemplateService {
  static async create(
    requesterId: string,
    reqBody: CreateNotificationTemplateRequest
  ) {
    const request = Validation.validate(
      NotificationTemplateValidation.CREATE,
      reqBody
    );

    await ensureAdminAccess(requesterId);

    const client = prismaNotificationTemplate();
    const channel = normalizeUpper(request.channel);
    const eventKey = normalizeUpper(request.eventKey);
    const recipientRole = normalizeUpper(request.recipientRole);
    const portalKeys = normalizePortalKeys(request.portalKeys);
    const now = new Date();

    const candidates = await client.notificationTemplate.findMany({
      where: {
        isDeleted: false,
        channel,
        eventKey,
        recipientRole,
      },
      include: notificationTemplateInclude,
    });

    const conflict = candidates.find((item) => matchesPortalScope(item, portalKeys));
    if (conflict) {
      throw new ResponseError(
        409,
        "Template with the same channel, event, recipient role, and portal scope already exists"
      );
    }

    const makeTemplateId = await generateNotificationTemplateId();
    const makePortalMappingId = await generateNotificationTemplatePortalId();

    const created = await client.$transaction(async (tx) => {
      const template = await tx.notificationTemplate.create({
        data: {
          notificationTemplateId: makeTemplateId(),
          templateName: request.templateName,
          channel,
          eventKey,
          recipientRole,
          messageTemplate: request.messageTemplate,
          isActive: request.isActive ?? true,
          isDeleted: false,
          createdAt: now,
          updatedAt: now,
          createdBy: requesterId,
          updatedBy: requesterId,
        },
      });

      for (const portalKey of portalKeys) {
        await tx.notificationTemplatePortal.create({
          data: {
            notificationTemplatePortalId: makePortalMappingId(),
            notificationTemplateId: template.notificationTemplateId,
            portalKey,
            isActive: true,
            isDeleted: false,
            createdAt: now,
            updatedAt: now,
            createdBy: requesterId,
            updatedBy: requesterId,
          },
        });
      }

      return tx.notificationTemplate.findUnique({
        where: { notificationTemplateId: template.notificationTemplateId },
        include: notificationTemplateInclude,
      });
    });

    if (!created) {
      throw new ResponseError(500, "Failed to create notification template");
    }

    return toNotificationTemplateResponse(created);
  }

  static async update(
    requesterId: string,
    reqBody: UpdateNotificationTemplateRequest
  ) {
    const request = Validation.validate(
      NotificationTemplateValidation.UPDATE,
      reqBody
    );

    await ensureAdminAccess(requesterId);

    const client = prismaNotificationTemplate();
    const existing = await client.notificationTemplate.findUnique({
      where: { notificationTemplateId: request.notificationTemplateId },
      include: notificationTemplateInclude,
    });

    if (!existing || existing.isDeleted) {
      throw new ResponseError(404, "Notification template not found");
    }

    const channel =
      request.channel !== undefined
        ? normalizeUpper(request.channel)
        : existing.channel;
    const eventKey =
      request.eventKey !== undefined
        ? normalizeUpper(request.eventKey)
        : existing.eventKey;
    const recipientRole =
      request.recipientRole !== undefined
        ? normalizeUpper(request.recipientRole)
        : existing.recipientRole;
    const portalKeys =
      request.portalKeys !== undefined
        ? normalizePortalKeys(request.portalKeys)
        : normalizePortalKeys(
            (existing.portalMappings ?? []).map((mapping: any) => mapping.portalKey)
          );

    const candidates = await client.notificationTemplate.findMany({
      where: {
        isDeleted: false,
        channel,
        eventKey,
        recipientRole,
        NOT: { notificationTemplateId: request.notificationTemplateId },
      },
      include: notificationTemplateInclude,
    });

    const conflict = candidates.find((item) => matchesPortalScope(item, portalKeys));
    if (conflict) {
      throw new ResponseError(
        409,
        "Template with the same channel, event, recipient role, and portal scope already exists"
      );
    }

    const now = new Date();
    const makePortalMappingId = await generateNotificationTemplatePortalId();

    const updated = await client.$transaction(async (tx) => {
      await tx.notificationTemplate.update({
        where: { notificationTemplateId: request.notificationTemplateId },
        data: {
          templateName: request.templateName ?? existing.templateName,
          channel,
          eventKey,
          recipientRole,
          messageTemplate: request.messageTemplate ?? existing.messageTemplate,
          isActive: request.isActive ?? existing.isActive,
          updatedAt: now,
          updatedBy: requesterId,
        },
      });

      if (request.portalKeys !== undefined) {
        await tx.notificationTemplatePortal.updateMany({
          where: {
            notificationTemplateId: request.notificationTemplateId,
            isDeleted: false,
          },
          data: {
            isDeleted: true,
            isActive: false,
            deletedAt: now,
            deletedBy: requesterId,
            updatedAt: now,
            updatedBy: requesterId,
          },
        });

        for (const portalKey of portalKeys) {
          await tx.notificationTemplatePortal.create({
            data: {
              notificationTemplatePortalId: makePortalMappingId(),
              notificationTemplateId: request.notificationTemplateId,
              portalKey,
              isActive: true,
              isDeleted: false,
              createdAt: now,
              updatedAt: now,
              createdBy: requesterId,
              updatedBy: requesterId,
            },
          });
        }
      }

      return tx.notificationTemplate.findUnique({
        where: { notificationTemplateId: request.notificationTemplateId },
        include: notificationTemplateInclude,
      });
    });

    if (!updated) {
      throw new ResponseError(500, "Failed to update notification template");
    }

    return toNotificationTemplateResponse(updated);
  }

  static async softDelete(
    requesterId: string,
    reqBody: DeleteNotificationTemplateRequest
  ) {
    const request = Validation.validate(
      NotificationTemplateValidation.DELETE,
      reqBody
    );

    await ensureAdminAccess(requesterId);

    const client = prismaNotificationTemplate();
    const existing = await client.notificationTemplate.findUnique({
      where: { notificationTemplateId: request.notificationTemplateId },
      include: notificationTemplateInclude,
    });

    if (!existing || existing.isDeleted) {
      throw new ResponseError(404, "Notification template not found");
    }

    const now = new Date();
    const updated = await client.$transaction(async (tx) => {
      await tx.notificationTemplatePortal.updateMany({
        where: {
          notificationTemplateId: request.notificationTemplateId,
          isDeleted: false,
        },
        data: {
          isDeleted: true,
          isActive: false,
          deletedAt: now,
          deletedBy: requesterId,
          updatedAt: now,
          updatedBy: requesterId,
        },
      });

      await tx.notificationTemplate.update({
        where: { notificationTemplateId: request.notificationTemplateId },
        data: {
          isDeleted: true,
          isActive: false,
          deletedAt: now,
          deletedBy: requesterId,
          updatedAt: now,
          updatedBy: requesterId,
        },
      });

      return tx.notificationTemplate.findUnique({
        where: { notificationTemplateId: request.notificationTemplateId },
        include: notificationTemplateInclude,
      });
    });

    if (!updated) {
      throw new ResponseError(500, "Failed to delete notification template");
    }

    return toNotificationTemplateResponse(updated);
  }

  static async sendWhatsappTest(
    requesterId: string
  ): Promise<TestWhatsappNotificationResponse> {
    await ensureAdminAccess(requesterId);

    const configuredUserIds = parseConfiguredTestRecipientIds();
    if (configuredUserIds.length === 0) {
      throw new ResponseError(
        400,
        "ONBOARDING_EXAM_MONITOR_USER_IDS belum diset"
      );
    }

    const employees = await prismaEmployee.em_employee.findMany({
      where: {
        UserId: {
          in: configuredUserIds,
        },
      },
      select: {
        UserId: true,
        CardNo: true,
        BadgeNum: true,
        Name: true,
        Phone: true,
      },
    });
    const employeeMap = new Map(
      employees.map((employee) => [employee.UserId, employee] as const)
    );
    const createNotificationOutboxId = await generateNotificationOutboxId();
    const sentAt = new Date();
    const sentAtText = formatDateTimeForNotification(sentAt);
    const results: TestNotificationRecipientResult[] = [];

    for (const userId of configuredUserIds) {
      const employee = employeeMap.get(userId);
      if (!employee) {
        results.push({
          userId,
          employeeName: null,
          phoneNumber: null,
          notificationOutboxId: null,
          status: "SKIPPED",
          error: "Employee not found",
        });
        continue;
      }

      const phoneNumber = normalizePhone(employee.Phone);
      const employeeName =
        normalizeOptionalText(employee.Name) ?? `Employee ${employee.UserId}`;
      const cardNumber =
        normalizeOptionalText(employee.CardNo) ??
        normalizeOptionalText(employee.BadgeNum) ??
        String(employee.UserId);

      if (!phoneNumber) {
        results.push({
          userId,
          employeeName,
          phoneNumber: null,
          notificationOutboxId: null,
          status: "SKIPPED",
          error: "Missing phone number",
        });
        continue;
      }

      const message = buildWhatsappTestMessage({
        employeeName,
        userId: employee.UserId,
        sentAtText,
      });
      const notificationOutboxId = createNotificationOutboxId();
      const meta = JSON.stringify({
        channel: CHANNEL_WHATSAPP,
        test: true,
        source: "ADMIN_WHATSAPP_SERVICE_TEST",
        requestedBy: requesterId,
        recipientUserId: employee.UserId,
        recipientName: employeeName,
        cardNumber,
        sentAt: sentAt.toISOString(),
      });

      await prismaFlowly.notificationOutbox.create({
        data: {
          notificationOutboxId,
          notificationTemplateId: null,
          portalKey: TEST_PORTAL_KEY,
          eventKey: TEST_EVENT_KEY,
          recipientRole: TEST_RECIPIENT_ROLE,
          recipientReferenceType: EMPLOYEE_REFERENCE_TYPE,
          recipientReferenceId: String(employee.UserId),
          contextReferenceType: TEST_CONTEXT_REFERENCE_TYPE,
          contextReferenceId: `${requesterId}:${employee.UserId}:${sentAt.getTime()}`,
          phoneNumber,
          message,
          status: "PROCESSING",
          attempts: 0,
          lastError: null,
          provider: null,
          sentAt: null,
          meta,
          isActive: true,
          isDeleted: false,
          createdAt: sentAt,
          createdBy: requesterId,
          updatedAt: sentAt,
          updatedBy: requesterId,
          deletedAt: null,
          deletedBy: null,
        },
      });

      try {
        await dispatchGenericNotificationOutboxItem({
          notificationOutboxId,
          phoneNumber,
          message,
          attempts: 0,
          meta,
          template: {
            channel: CHANNEL_WHATSAPP,
          },
        });
      } catch (error) {
        await prismaFlowly.notificationOutbox.update({
          where: { notificationOutboxId },
          data: {
            attempts: 1,
            status: "FAILED",
            lastError: buildErrorMessage(error).slice(0, 500),
            provider: "WHAPI",
            sentAt: null,
            updatedAt: new Date(),
            updatedBy: "SYSTEM",
          },
        });
      }

      const outbox = await prismaFlowly.notificationOutbox.findUnique({
        where: { notificationOutboxId },
        select: {
          status: true,
          lastError: true,
        },
      });

      results.push({
        userId,
        employeeName,
        phoneNumber,
        notificationOutboxId,
        status:
          outbox?.status === "PENDING" && outbox.lastError
            ? "FAILED"
            : outbox?.status ?? "PENDING",
        error: outbox?.lastError ?? null,
      });
    }

    return {
      configuredUserIds,
      sent: results.filter((item) => item.status === "SENT").length,
      pending: results.filter((item) => item.status === "PENDING").length,
      failed: results.filter((item) => item.status === "FAILED").length,
      skipped: results.filter((item) => item.status === "SKIPPED").length,
      recipients: results,
    };
  }

  static async list(
    requesterId: string,
    filters?: {
      channel?: string;
      eventKey?: string;
      recipientRole?: string;
      isActive?: boolean;
      portalKey?: string;
    }
  ) {
    await ensureAdminAccess(requesterId);

    const client = prismaNotificationTemplate();
    const items = await client.notificationTemplate.findMany({
      where: {
        isDeleted: false,
        ...(filters?.channel
          ? { channel: normalizeUpper(filters.channel) }
          : {}),
        ...(filters?.eventKey
          ? { eventKey: normalizeUpper(filters.eventKey) }
          : {}),
        ...(filters?.recipientRole
          ? { recipientRole: normalizeUpper(filters.recipientRole) }
          : {}),
        ...(filters?.isActive !== undefined ? { isActive: filters.isActive } : {}),
        ...(filters?.portalKey
          ? {
              portalMappings: {
                some: {
                  portalKey: normalizeUpper(filters.portalKey),
                  isDeleted: false,
                },
              },
            }
          : {}),
      },
      include: notificationTemplateInclude,
      orderBy: { updatedAt: "desc" },
    });

    return items.map(toNotificationTemplateListResponse);
  }
}
