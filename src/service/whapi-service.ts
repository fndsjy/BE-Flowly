import { logger } from "../application/logging.js";

const rawBaseUrl = (process.env.WHAPI_BASE_URL ?? "").trim();
const WHAPI_BASE_URL = rawBaseUrl.replace(/\/+$/, "");
const WHAPI_API_KEY = (process.env.WHAPI_API_KEY ?? "").trim();

type WhapiResponse = {
  code?: number;
  status?: string;
  results?: {
    convert?: string;
    id?: string;
    messageId?: string;
  };
  [key: string]: unknown;
};

type SendWhapiMessageOptions = {
  source?: string;
  referenceId?: string;
  rawPhone?: string;
};

const buildUrl = (path: string) => {
  if (!WHAPI_BASE_URL) {
    throw new Error("WHAPI_BASE_URL is not set");
  }
  const cleanedPath = path.replace(/^\/+/, "");
  return `${WHAPI_BASE_URL}/${cleanedPath}`;
};

const postForm = async (
  path: string,
  payload: Record<string, string>,
  options?: { idempotencyKey?: string }
) => {
  const response = await fetch(buildUrl(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      ...(options?.idempotencyKey
        ? { "Idempotency-Key": options.idempotencyKey }
        : {}),
    },
    body: new URLSearchParams(payload).toString(),
  });
  const data = (await response.json().catch(() => ({}))) as WhapiResponse;
  return { ok: response.ok, status: response.status, data };
};

const normalizeConvertedNumber = (value: string) =>
  value
    .trim()
    .replace(/@(c\.us|s\.whatsapp\.net)$/i, "")
    .replace(/[^\d]/g, "");

const maskPhone = (value: string) => {
  const digits = normalizeConvertedNumber(value);
  if (digits.length <= 6) return digits;
  return `${digits.slice(0, 4)}***${digits.slice(-4)}`;
};

export const convertWhapiNumber = async (phone: string) => {
  const { ok, data } = await postForm("convertNumber", { phone });
  const code = typeof data?.code === "number" ? data.code : undefined;
  if (!ok || (code !== undefined && code >= 400)) {
    return {
      ok: false,
      error: data,
    };
  }
  const converted = data?.results?.convert;
  if (!converted || typeof converted !== "string") {
    return {
      ok: false,
      error: { message: "No converted number", data },
    };
  }
  return {
    ok: true,
    number: normalizeConvertedNumber(converted),
  };
};

export const sendWhapiMessage = async (
  phone: string,
  message: string,
  options?: SendWhapiMessageOptions
) => {
  if (!WHAPI_API_KEY) {
    logger.warn("WHAPI_API_KEY is not set. Unable to send WhatsApp message.");
    return {
      ok: false,
      error: { message: "WHAPI_API_KEY is not set" },
    };
  }
  const normalizedPhone = normalizeConvertedNumber(phone);
  if (!normalizedPhone) {
    return {
      ok: false,
      error: { message: "Invalid phone number" },
    };
  }

  logger.info("Sending WHAPI message", {
    source: options?.source,
    referenceId: options?.referenceId,
    rawPhone: options?.rawPhone ? maskPhone(options.rawPhone) : undefined,
    phone: maskPhone(normalizedPhone),
    messageLength: message.length,
  });

  const referenceId = options?.referenceId?.trim();
  const { ok, status, data } = await postForm(
    "sendMessage",
    {
      apiKey: WHAPI_API_KEY,
      phone: normalizedPhone,
      message,
      ...(referenceId
        ? {
            referenceId,
            idempotencyKey: referenceId,
            clientMessageId: referenceId,
          }
        : {}),
    },
    referenceId ? { idempotencyKey: referenceId } : undefined
  );
  const code = typeof data?.code === "number" ? data.code : undefined;
  const isOk = ok && (code === undefined || code < 400);
  logger.info("WHAPI sendMessage response", {
    source: options?.source,
    referenceId: options?.referenceId,
    phone: maskPhone(normalizedPhone),
    httpStatus: status,
    ok: isOk,
    providerCode: code,
    providerStatus: typeof data?.status === "string" ? data.status : undefined,
    providerMessageId:
      typeof data?.results?.id === "string"
        ? data.results.id
        : typeof data?.results?.messageId === "string"
          ? data.results.messageId
          : undefined,
  });
  return {
    ok: isOk,
    data,
  };
};
