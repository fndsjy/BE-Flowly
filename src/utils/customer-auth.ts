import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";

export type CustomerAuthPayload = {
  type: "customer";
  custid: string;
  sessionId: string;
  iat?: number;
  exp?: number;
};

const getCustomerJwtSecret = () =>
  process.env.CUSTOMER_SSO_JWT_SECRET ||
  process.env.JWT_SECRET ||
  "supersecret";

type JwtExpiresIn = NonNullable<SignOptions["expiresIn"]>;

const getCustomerTokenExpiresIn = (): JwtExpiresIn =>
  (process.env.CUSTOMER_SSO_TOKEN_EXPIRES_IN ||
    "8h") as JwtExpiresIn;

export const generateCustomerToken = (payload: Omit<CustomerAuthPayload, "type">) =>
  jwt.sign(
    {
      type: "customer",
      custid: payload.custid,
      sessionId: payload.sessionId,
    },
    getCustomerJwtSecret(),
    { expiresIn: getCustomerTokenExpiresIn() }
  );

export const verifyCustomerToken = (token: string) => {
  const payload = jwt.verify(token, getCustomerJwtSecret()) as CustomerAuthPayload;

  if (payload.type !== "customer" || !payload.custid || !payload.sessionId) {
    throw new Error("Invalid customer token");
  }

  return payload;
};

export const getCustomerTokenExpiresInSeconds = (token: string) => {
  try {
    const decoded = jwt.decode(token) as { exp?: number } | null;
    if (!decoded?.exp) {
      return 0;
    }

    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, decoded.exp - now);
  } catch {
    return 0;
  }
};
