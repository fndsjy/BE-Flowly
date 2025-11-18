import jwt from "jsonwebtoken";
export const generateToken = (user) => {
    return jwt.sign({ userId: user.userId, username: user.username, roleId: user.roleId }, process.env.JWT_SECRET || "supersecret", { expiresIn: "3h" });
};
// Helper to get token expiration time (in seconds or ms)
export const getTokenExpiresIn = (token) => {
    try {
        const decoded = jwt.decode(token);
        if (!decoded.exp)
            return 0;
        const now = Math.floor(Date.now() / 1000);
        return Math.max(0, decoded.exp - now); // in seconds
    }
    catch {
        return 0;
    }
};
export const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET || "supersecret");
};
//# sourceMappingURL=auth.js.map