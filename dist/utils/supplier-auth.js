import jwt from "jsonwebtoken";
const getSupplierJwtSecret = () => process.env.SUPPLIER_SSO_JWT_SECRET ||
    process.env.JWT_SECRET ||
    "supersecret";
const getSupplierTokenExpiresIn = () => (process.env.SUPPLIER_SSO_TOKEN_EXPIRES_IN ||
    "8h");
export const generateSupplierToken = (payload) => jwt.sign({
    type: "supplier",
    supplierId: payload.supplierId,
    sessionId: payload.sessionId,
}, getSupplierJwtSecret(), { expiresIn: getSupplierTokenExpiresIn() });
export const verifySupplierToken = (token) => {
    const payload = jwt.verify(token, getSupplierJwtSecret());
    if (payload.type !== "supplier" ||
        !payload.supplierId ||
        !payload.sessionId) {
        throw new Error("Invalid supplier token");
    }
    return payload;
};
export const getSupplierTokenExpiresInSeconds = (token) => {
    try {
        const decoded = jwt.decode(token);
        if (!decoded?.exp) {
            return 0;
        }
        const now = Math.floor(Date.now() / 1000);
        return Math.max(0, decoded.exp - now);
    }
    catch {
        return 0;
    }
};
//# sourceMappingURL=supplier-auth.js.map