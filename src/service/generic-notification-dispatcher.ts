import { prismaFlowly } from "../application/database.js";
import { logger } from "../application/logging.js";
import { convertWhapiNumber, sendWhapiMessage } from "./whapi-service.js";

const DEFAULT_BATCH_SIZE = 10;
const DEFAULT_MAX_ATTEMPTS = 3;
const CHANNEL_WHATSAPP = "WHATSAPP";
const CHANNEL_EMAIL = "EMAIL";

const getBatchSize = () => {
  const value = Number(
    process.env.NOTIFICATION_BATCH_SIZE ??
      process.env.WHAPI_BATCH_SIZE ??
      DEFAULT_BATCH_SIZE
  );
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_BATCH_SIZE;
};

const getMaxAttempts = () => {
  const value = Number(
    process.env.NOTIFICATION_MAX_ATTEMPTS ??
      process.env.WHAPI_MAX_ATTEMPTS ??
      DEFAULT_MAX_ATTEMPTS
  );
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_MAX_ATTEMPTS;
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
    forceFailed?: boolean;
  }
) => {
  const maxAttempts = getMaxAttempts();
  const status =
    options?.forceFailed || attempts >= maxAttempts ? "FAILED" : "PENDING";

  await prismaFlowly.notificationOutbox.update({
    where: { notificationOutboxId: id },
    data: {
      attempts,
      lastError,
      status,
      provider: options?.provider ?? null,
      sentAt: null,
      updatedAt: new Date(),
      updatedBy: "SYSTEM",
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
      status: "SENT",
      provider,
      sentAt: new Date(),
      updatedAt: new Date(),
      updatedBy: "SYSTEM",
    },
  });
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

const dispatchOutboxItem = async (item: {
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

    const sendResult = await sendWhapiMessage(convertResult.number, message);
    if (!sendResult.ok) {
      await markOutboxFailed(
        item.notificationOutboxId,
        attempts,
        buildErrorMessage(sendResult.data ?? sendResult.error),
        { provider: "WHAPI" }
      );
      return;
    }

    await markOutboxSent(item.notificationOutboxId, attempts, "WHAPI");
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
      forceFailed: true,
    });
    return;
  }

  await markOutboxFailed(
    item.notificationOutboxId,
    attempts,
    `Unsupported notification channel: ${channel || "UNKNOWN"}`,
    {
      provider: channel || null,
      forceFailed: true,
    }
  );
};

export const processGenericNotificationOutbox = async () => {
  if (isRunning) return;
  isRunning = true;

  try {
    const batchSize = getBatchSize();
    const maxAttempts = getMaxAttempts();
    const items = await prismaFlowly.notificationOutbox.findMany({
      where: {
        isDeleted: false,
        status: "PENDING",
        attempts: { lt: maxAttempts },
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
      try {
        await dispatchOutboxItem(item);
      } catch (error) {
        logger.warn("Failed to dispatch generic notification", {
          notificationOutboxId: item.notificationOutboxId,
          error: buildErrorMessage(error),
        });
        await markOutboxFailed(
          item.notificationOutboxId,
          item.attempts + 1,
          buildErrorMessage(error)
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
