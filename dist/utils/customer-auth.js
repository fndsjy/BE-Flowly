import jwt from "jsonwebtoken";
const getCustomerJwtSecret = () => process.env.CUSTOMER_SSO_JWT_SECRET ||
    process.env.JWT_SECRET ||
    "supersecret";
const getCustomerTokenExpiresIn = () => (process.env.CUSTOMER_SSO_TOKEN_EXPIRES_IN ||
    "8h");
export const generateCustomerToken = (payload) => jwt.sign({
    type: "customer",
    custid: payload.custid,
    sessionId: payload.sessionId,
}, getCustomerJwtSecret(), { expiresIn: getCustomerTokenExpiresIn() });
export const verifyCustomerToken = (token) => {
    const payload = jwt.verify(token, getCustomerJwtSecret());
    if (payload.type !== "customer" || !payload.custid || !payload.sessionId) {
        throw new Error("Invalid customer token");
    }
    return payload;
};
export const getCustomerTokenExpiresInSeconds = (token) => {
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
//# sourceMappingURL=customer-auth.js.map