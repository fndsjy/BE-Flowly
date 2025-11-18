// src/utils/auth.ts
import jwt from "jsonwebtoken";
export const generateToken = (user) => {
    return jwt.sign({ userId: user.userId, username: user.username, roleId: user.roleId }, process.env.JWT_SECRET || "supersecret", { expiresIn: "7d" });
};
export const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET || "supersecret");
};
//# sourceMappingURL=auth.js.map