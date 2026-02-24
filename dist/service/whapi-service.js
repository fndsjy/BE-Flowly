import { logger } from "../application/logging.js";
const rawBaseUrl = (process.env.WHAPI_BASE_URL ?? "").trim();
const WHAPI_BASE_URL = rawBaseUrl.replace(/\/+$/, "");
const WHAPI_API_KEY = (process.env.WHAPI_API_KEY ?? "").trim();
const buildUrl = (path) => {
    if (!WHAPI_BASE_URL) {
        throw new Error("WHAPI_BASE_URL is not set");
    }
    const cleanedPath = path.replace(/^\/+/, "");
    return `${WHAPI_BASE_URL}/${cleanedPath}`;
};
const postForm = async (path, payload) => {
    const response = await fetch(buildUrl(path), {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(payload).toString(),
    });
    const data = (await response.json().catch(() => ({})));
    return { ok: response.ok, status: response.status, data };
};
export const convertWhapiNumber = async (phone) => {
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
        number: converted.replace("@c.us", ""),
    };
};
export const sendWhapiMessage = async (phone, message) => {
    if (!WHAPI_API_KEY) {
        logger.warn("WHAPI_API_KEY is not set. Unable to send WhatsApp message.");
        return {
            ok: false,
            error: { message: "WHAPI_API_KEY is not set" },
        };
    }
    const { ok, data } = await postForm("sendMessage", {
        apiKey: WHAPI_API_KEY,
        phone,
        message,
    });
    const code = typeof data?.code === "number" ? data.code : undefined;
    const isOk = ok && (code === undefined || code < 400);
    return {
        ok: isOk,
        data,
    };
};
//# sourceMappingURL=whapi-service.js.map