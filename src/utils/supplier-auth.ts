import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";

export type SupplierAuthPayload = {
  type: "supplier";
  supplierId: string;
  sessionId: string;
  iat?: number;
  exp?: number;
};

const getSupplierJwtSecret = () =>
  process.env.SUPPLIER_SSO_JWT_SECRET ||
  process.env.JWT_SECRET ||
  "supersecret";

type JwtExpiresIn = NonNullable<SignOptions["expiresIn"]>;

const getSupplierTokenExpiresIn = (): JwtExpiresIn =>
  (process.env.SUPPLIER_SSO_TOKEN_EXPIRES_IN ||
    "8h") as JwtExpiresIn;

export const generateSupplierToken = (
  payload: Omit<SupplierAuthPayload, "type">
) =>
  jwt.sign(
    {
      type: "supplier",
      supplierId: payload.supplierId,
      sessionId: payload.sessionId,
    },
    getSupplierJwtSecret(),
    { expiresIn: getSupplierTokenExpiresIn() }
  );

export const verifySupplierToken = (token: string) => {
  const payload = jwt.verify(
    token,
    getSupplierJwtSecret()
  ) as SupplierAuthPayload;

  if (
    payload.type !== "supplier" ||
    !payload.supplierId ||
    !payload.sessionId
  ) {
    throw new Error("Invalid supplier token");
  }

  return payload;
};

export const getSupplierTokenExpiresInSeconds = (token: string) => {
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
