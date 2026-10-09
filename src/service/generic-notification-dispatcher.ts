import { claimGenericDelivery } from "./notification-outbox-deduplication.js";
import { sendAndRecordNotification } from "./notification-delivery.js";
import { prismaFlowly } from "../application/database.js";
import { logger } from "../application/logging.js";
import { convertWhapiNumber, sendWhapiMessage } from "./whapi-service.js";

const DEFAULT_BATCH_SIZE = 10;
const CHANNEL_WHATSAPP = "WHATSAPP";
const CHANNEL_EMAIL = "EMAIL";
const OUTBOX_STATUS_PENDING = "PENDING";
const OUTBOX_STATUS_PROCESSING = "PROCESSING";
const OUTBOX_STATUS_SENT = "SENT";
const OUTBOX_STATUS_FAILED = "FAILED";
const SYSTEM_ACTOR = "SYSTEM";

const getBatchSize = () => {
  const value = Number(
    process.env.NOTIFICATION_BATCH_SIZE ??
      process.env.WHAPI_BATCH_SIZE ??
      DEFAULT_BATCH_SIZE
  );
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_BATCH_SIZE;
};


let isRunning = false;

const buildErrorMessage = (value: unknown) => {
  if (!value) return "Unknown error";
  if (value instanceof Error) return value.message;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const normalizeChannel = (value?: string | null) =>
  (value ?? "").trim().toUpperCase();

const parseMeta = (value?: string | null) => {
  if (!value) return {};
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return {};
  }
};

const markOutboxFailed = async (
  id: string,
  attempts: number,
  lastError: string,
  options?: {
    provider?: string | null;
  }
) => {
  await prismaFlowly.notificationOutbox.update({
    where: { notificationOutboxId: id },
    data: {
      attempts,
      lastError: (lastError.startsWith("DELIVERY_UNCERTAIN:") ? lastError : `DELIVERY_NOT_SENT: ${lastError}`).slice(0, 500),
      status: OUTBOX_STATUS_FAILED,
      provider: options?.provider ?? null,
      sentAt: null,
      updatedAt: new Date(),
      updatedBy: SYSTEM_ACTOR,
    },
  });
};

const markOutboxSent = async (
  id: string,
  attempts: number,
  provider: string
) => {
  await prismaFlowly.notificationOutbox.update({
    where: { notificationOutboxId: id },
    data: {
      attempts,
      lastError: null,
      status: OUTBOX_STATUS_SENT,
      provider,
      sentAt: new Date(),
      updatedAt: new Date(),
      updatedBy: SYSTEM_ACTOR,
    },
  });
};

const claimPendingOutbox = async (id: string, attempts: number) => {
  const result = await prismaFlowly.notificationOutbox.updateMany({
    where: {
      notificationOutboxId: id,
      attempts: 0,
      status: OUTBOX_STATUS_PENDING,
      isDeleted: false,
    },
    data: {
      status: OUTBOX_STATUS_PROCESSING,
      lastError: "DELIVERY_PREPARING",
      updatedAt: new Date(),
      updatedBy: SYSTEM_ACTOR,
    },
  });

  return result.count === 1;
};

const resolveChannel = (item: {
  meta?: string | null;
  template?: { channel?: string | null } | null;
}) => {
  const templateChannel = normalizeChannel(item.template?.channel);
  if (templateChannel) {
    return templateChannel;
  }

  const meta = parseMeta(item.meta);
  return normalizeChannel(typeof meta.channel === "string" ? meta.channel : null);
};

export const dispatchGenericNotificationOutboxItem = async (item: {
  notificationOutboxId: string;
  phoneNumber: string;
  message: string;
  attempts: number;
  meta?: string | null;
  template?: { channel?: string | null } | null;
}) => {
  const attempts = item.attempts + 1;
  const channel = resolveChannel(item);
  const message = item.message.trim();

  if (!message) {
    await markOutboxFailed(
      item.notificationOutboxId,
      attempts,
      "Missing notification message"
    );
    return;
  }

  if (channel === CHANNEL_WHATSAPP) {
    if (!item.phoneNumber.trim()) {
      await markOutboxFailed(
        item.notificationOutboxId,
        attempts,
        "Missing phone number",
        { provider: CHANNEL_WHATSAPP }
      );
      return;
    }

    const convertResult = await convertWhapiNumber(item.phoneNumber);
    if (!convertResult.ok || !convertResult.number) {
      await markOutboxFailed(
        item.notificationOutboxId,
        attempts,
        buildErrorMessage(convertResult.error),
        { provider: "WHAPI" }
      );
      return;
    }

    // Persist the send attempt before contacting the provider. A crashed send
    // remains PROCESSING until its delivery can be reconciled.
    const sendClaim = await claimGenericDelivery(item.notificationOutboxId, item.attempts, convertResult.number);
    if (!sendClaim) return;

    await sendAndRecordNotification(
      () => sendWhapiMessage(convertResult.number!, message, {
        source: "notification_outbox",
        referenceId: item.notificationOutboxId,
        rawPhone: item.phoneNumber,
      }),
      () => markOutboxSent(item.notificationOutboxId, attempts, "WHAPI")
    );
    return;
  }

  if (channel === CHANNEL_EMAIL) {
    const meta = parseMeta(item.meta);
    const email =
      typeof meta.email === "string" ? meta.email.trim() : "";
    const reason = email
      ? "Email dispatch is not implemented yet"
      : "Missing email address and email dispatch is not implemented yet";

    await markOutboxFailed(item.notificationOutboxId, attempts, reason, {
      provider: CHANNEL_EMAIL,
    });
    return;
  }

  await markOutboxFailed(
    item.notificationOutboxId,
    attempts,
    `Unsupported notification channel: ${channel || "UNKNOWN"}`,
    {
      provider: channel || null,
    }
  );
};

export const processGenericNotificationOutbox = async () => {
  if (isRunning) return;
  isRunning = true;

  try {
    const batchSize = getBatchSize();
    // Retire retry work left by older versions without contacting the provider.
    await prismaFlowly.notificationOutbox.updateMany({
      where: { status: OUTBOX_STATUS_PENDING, attempts: { gt: 0 }, isDeleted: false },
      data: { status: OUTBOX_STATUS_FAILED, updatedBy: SYSTEM_ACTOR },
    });
    const items = await prismaFlowly.notificationOutbox.findMany({
      where: {
        isDeleted: false,
        status: OUTBOX_STATUS_PENDING,
        attempts: 0,
      },
      orderBy: { createdAt: "asc" },
      take: batchSize,
      select: {
        notificationOutboxId: true,
        phoneNumber: true,
        message: true,
        attempts: true,
        meta: true,
        template: {
          select: {
            channel: true,
          },
        },
      },
    });

    for (const item of items) {
      const claimed = await claimPendingOutbox(item.notificationOutboxId, item.attempts);
      if (!claimed) {
        continue;
      }

      try {
        await dispatchGenericNotificationOutboxItem(item);
      } catch (error) {
        logger.warn("Failed to dispatch generic notification", {
          notificationOutboxId: item.notificationOutboxId,
          error: buildErrorMessage(error),
        });
        await markOutboxFailed(
          item.notificationOutboxId,
          item.attempts + 1,
          buildErrorMessage(error),
          { provider: "WHAPI" }
        );
      }
    }
  } catch (error) {
    logger.error("Failed to process generic notification outbox", {
      error: buildErrorMessage(error),
    });
  } finally {
    isRunning = false;
  }
};
