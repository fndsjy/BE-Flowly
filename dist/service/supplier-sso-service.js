import { randomUUID } from "crypto";
import { ResponseError } from "../error/response-error.js";
import { generateSupplierToken, getSupplierTokenExpiresInSeconds, verifySupplierToken, } from "../utils/supplier-auth.js";
const supplierSessions = new Map();
const ORDER_DOMAS_GET_SUPPLIER_URL = process.env.ORDER_DOMAS_GET_SUPPLIER_URL ||
    process.env.ORDER_DOMAS_GET_SUPP_URL ||
    "https://order.domas.co.id/api/intern/get-supp";
const normalizeText = (value) => {
    if (typeof value === "string") {
        return value.trim();
    }
    if (value === null || value === undefined) {
        return "";
    }
    return String(value).trim();
};
const resolveOrderDomasError = (payload) => {
    const message = normalizeText(payload.message) || normalizeText(payload.error);
    return message || "Token supplier tidak valid";
};
const normalizeSupplierRows = (value) => {
    if (Array.isArray(value)) {
        return value.filter((item) => Boolean(item) && typeof item === "object" && !Array.isArray(item));
    }
    if (value && typeof value === "object") {
        return [value];
    }
    return [];
};
const readSupplierId = (payload, rows) => normalizeText(payload.supplierId) ||
    normalizeText(payload.supplierid) ||
    normalizeText(payload.suppId) ||
    normalizeText(payload.suppid) ||
    normalizeText(rows[0]?.supplierId) ||
    normalizeText(rows[0]?.supplierid) ||
    normalizeText(rows[0]?.suppId) ||
    normalizeText(rows[0]?.suppid);
const readSupplierValue = (data, keys) => {
    if (!data) {
        return "";
    }
    for (const key of keys) {
        const value = normalizeText(data[key]);
        if (value) {
            return value;
        }
    }
    return "";
};
const pruneExpiredSupplierSessions = () => {
    const now = Date.now();
    for (const [sessionId, session] of supplierSessions) {
        if (session.expiresAt <= now) {
            supplierSessions.delete(sessionId);
        }
    }
};
const getSupplierSession = (sessionId) => {
    pruneExpiredSupplierSessions();
    const session = supplierSessions.get(sessionId);
    if (!session || session.expiresAt <= Date.now()) {
        supplierSessions.delete(sessionId);
        return null;
    }
    return session;
};
const fetchSupplierFromOrderDomas = async (token) => {
    const headers = {
        Accept: "application/json",
    };
    const cookie = process.env.ORDER_DOMAS_COOKIE?.trim();
    if (cookie) {
        headers.Cookie = cookie;
    }
    const body = new FormData();
    body.set("token", token);
    let response;
    try {
        response = await fetch(ORDER_DOMAS_GET_SUPPLIER_URL, {
            method: "POST",
            headers,
            body,
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new ResponseError(502, `Gagal menghubungi Order Domas untuk validasi supplier: ${message}`);
    }
    let payload;
    try {
        payload = (await response.json());
    }
    catch {
        throw new ResponseError(502, "Response Order Domas tidak berbentuk JSON valid");
    }
    const rows = normalizeSupplierRows(payload.data);
    const status = normalizeText(payload.status).toLowerCase();
    const supplierId = readSupplierId(payload, rows);
    const isExplicitFailure = ["error", "fail", "failed", "invalid"].includes(status);
    if (supplierId && !isExplicitFailure && (response.ok || status === "success")) {
        return {
            supplierId,
            data: rows,
        };
    }
    if (!response.ok) {
        throw new ResponseError(502, `Validasi supplier ke Order Domas gagal (${response.status})`);
    }
    if (!supplierId) {
        throw new ResponseError(401, resolveOrderDomasError(payload));
    }
    throw new ResponseError(401, resolveOrderDomasError(payload));
};
const toSupplierProfile = (supplierId, data = []) => ({
    userId: `SUPPLIER-${supplierId}`,
    username: readSupplierValue(data[0], ["email", "username"]) || supplierId,
    name: readSupplierValue(data[0], [
        "supplierName",
        "suppliername",
        "suppName",
        "suppname",
        "companyName",
        "companyname",
        "nama",
        "name",
    ]) || `Supplier ${supplierId}`,
    cardNumber: supplierId,
    department: readSupplierValue(data[0], [
        "address",
        "alamat",
        "city",
        "kota",
        "country",
        "negara",
    ]) || null,
    roleId: "SUPPLIER",
    roleName: "Supplier",
    roleLevel: 4,
    supplierId,
    supplier: data[0] ?? null,
    supplierData: data,
});
export class SupplierSsoService {
    static async login(token) {
        const normalizedToken = normalizeText(token);
        if (!normalizedToken) {
            throw new ResponseError(400, "Token supplier wajib diisi");
        }
        const supplier = await fetchSupplierFromOrderDomas(normalizedToken);
        const temporarySessionId = randomUUID();
        const sessionToken = generateSupplierToken({
            supplierId: supplier.supplierId,
            sessionId: temporarySessionId,
        });
        const expiresIn = getSupplierTokenExpiresInSeconds(sessionToken);
        supplierSessions.set(temporarySessionId, {
            supplierId: supplier.supplierId,
            data: supplier.data,
            expiresAt: Date.now() + Math.max(expiresIn, 60) * 1000,
        });
        pruneExpiredSupplierSessions();
        return {
            ...supplier,
            token: sessionToken,
            expiresIn,
        };
    }
    static getProfile(token) {
        const normalizedToken = normalizeText(token);
        if (!normalizedToken) {
            throw new ResponseError(401, "Unauthorized");
        }
        try {
            const payload = verifySupplierToken(normalizedToken);
            const session = getSupplierSession(payload.sessionId);
            if (!session || session.supplierId !== payload.supplierId) {
                throw new ResponseError(401, "Session supplier sudah berakhir");
            }
            return toSupplierProfile(payload.supplierId, session.data);
        }
        catch {
            throw new ResponseError(401, "Unauthorized");
        }
    }
    static logout(token) {
        const normalizedToken = normalizeText(token);
        if (!normalizedToken) {
            return;
        }
        try {
            const payload = verifySupplierToken(normalizedToken);
            supplierSessions.delete(payload.sessionId);
        }
        catch {
            // Cookie cleanup should still continue even if the token is already invalid.
        }
    }
}
//# sourceMappingURL=supplier-sso-service.js.map