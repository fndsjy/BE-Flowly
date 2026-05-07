import { randomUUID } from "crypto";
import { ResponseError } from "../error/response-error.js";
import { generateCustomerToken, getCustomerTokenExpiresInSeconds, verifyCustomerToken } from "../utils/customer-auth.js";

type OrderDomasCustomerResponse = {
  status?: unknown;
  custid?: unknown;
  data?: unknown;
  message?: unknown;
  error?: unknown;
};

export type CustomerSsoLoginResponse = {
  custid: string;
  token: string;
  expiresIn: number;
  data: CustomerDomasData[];
};

export type CustomerSsoProfileResponse = {
  userId: string;
  username: string;
  name: string;
  cardNumber: string;
  department: string | null;
  roleId: "CUSTOMER";
  roleName: "Customer";
  roleLevel: number;
  custid: string;
  customer: CustomerDomasData | null;
  customerData: CustomerDomasData[];
};

type CustomerDomasData = Record<string, unknown>;

type CustomerSession = {
  custid: string;
  data: CustomerDomasData[];
  expiresAt: number;
};

const customerSessions = new Map<string, CustomerSession>();

const ORDER_DOMAS_GET_CUST_URL =
  process.env.ORDER_DOMAS_GET_CUST_URL ||
  "https://order.domas.co.id/api/intern/get-cust";

const normalizeText = (value: unknown) => {
  if (typeof value === "string") {
    return value.trim();
  }

  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
};

const resolveOrderDomasError = (payload: OrderDomasCustomerResponse) => {
  const message = normalizeText(payload.message) || normalizeText(payload.error);
  return message || "Token customer tidak valid";
};

const normalizeCustomerRows = (value: unknown): CustomerDomasData[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is CustomerDomasData =>
      Boolean(item) && typeof item === "object" && !Array.isArray(item)
  );
};

const pruneExpiredCustomerSessions = () => {
  const now = Date.now();
  for (const [sessionId, session] of customerSessions) {
    if (session.expiresAt <= now) {
      customerSessions.delete(sessionId);
    }
  }
};

const getCustomerSession = (sessionId: string) => {
  pruneExpiredCustomerSessions();

  const session = customerSessions.get(sessionId);
  if (!session || session.expiresAt <= Date.now()) {
    customerSessions.delete(sessionId);
    return null;
  }

  return session;
};

const fetchCustomerFromOrderDomas = async (token: string) => {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  const cookie = process.env.ORDER_DOMAS_COOKIE?.trim();
  if (cookie) {
    headers.Cookie = cookie;
  }

  const body = new FormData();
  body.set("token", token);

  let response: Response;
  try {
    response = await fetch(ORDER_DOMAS_GET_CUST_URL, {
      method: "POST",
      headers,
      body,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new ResponseError(
      502,
      `Gagal menghubungi Order Domas untuk validasi customer: ${message}`
    );
  }

  let payload: OrderDomasCustomerResponse;
  try {
    payload = (await response.json()) as OrderDomasCustomerResponse;
  } catch {
    throw new ResponseError(502, "Response Order Domas tidak berbentuk JSON valid");
  }

  const status = normalizeText(payload.status).toLowerCase();
  const custid = normalizeText(payload.custid);
  if (status === "success" && custid) {
    return {
      custid,
      data: normalizeCustomerRows(payload.data),
    };
  }

  if (!response.ok) {
    throw new ResponseError(
      502,
      `Validasi customer ke Order Domas gagal (${response.status})`
    );
  }

  if (!custid) {
    throw new ResponseError(401, resolveOrderDomasError(payload));
  }

  throw new ResponseError(401, resolveOrderDomasError(payload));
};

const toCustomerProfile = (
  custid: string,
  data: CustomerDomasData[] = []
): CustomerSsoProfileResponse => ({
  userId: `CUSTOMER-${custid}`,
  username: normalizeText(data[0]?.email) || custid,
  name: normalizeText(data[0]?.custname) || `Customer ${custid}`,
  cardNumber: custid,
  department: normalizeText(data[0]?.address) || null,
  roleId: "CUSTOMER",
  roleName: "Customer",
  roleLevel: 4,
  custid,
  customer: data[0] ?? null,
  customerData: data,
});

export class CustomerSsoService {
  static async login(token: unknown): Promise<CustomerSsoLoginResponse> {
    const normalizedToken = normalizeText(token);
    if (!normalizedToken) {
      throw new ResponseError(400, "Token customer wajib diisi");
    }

    const customer = await fetchCustomerFromOrderDomas(normalizedToken);
    const temporarySessionId = randomUUID();
    const sessionToken = generateCustomerToken({
      custid: customer.custid,
      sessionId: temporarySessionId,
    });
    const expiresIn = getCustomerTokenExpiresInSeconds(sessionToken);
    customerSessions.set(temporarySessionId, {
      custid: customer.custid,
      data: customer.data,
      expiresAt: Date.now() + Math.max(expiresIn, 60) * 1000,
    });
    pruneExpiredCustomerSessions();

    return {
      ...customer,
      token: sessionToken,
      expiresIn,
    };
  }

  static getProfile(token: unknown): CustomerSsoProfileResponse {
    const normalizedToken = normalizeText(token);
    if (!normalizedToken) {
      throw new ResponseError(401, "Unauthorized");
    }

    try {
      const payload = verifyCustomerToken(normalizedToken);
      const session = getCustomerSession(payload.sessionId);
      if (!session || session.custid !== payload.custid) {
        throw new ResponseError(401, "Session customer sudah berakhir");
      }

      return toCustomerProfile(payload.custid, session.data);
    } catch {
      throw new ResponseError(401, "Unauthorized");
    }
  }

  static logout(token: unknown) {
    const normalizedToken = normalizeText(token);
    if (!normalizedToken) {
      return;
    }

    try {
      const payload = verifyCustomerToken(normalizedToken);
      customerSessions.delete(payload.sessionId);
    } catch {
      // Cookie cleanup should still continue even if the token is already invalid.
    }
  }
}
