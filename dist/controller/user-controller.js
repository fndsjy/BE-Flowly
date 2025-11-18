import { UserService } from "../service/user-service.js";
import { verifyToken } from "../utils/auth.js";
import { ResponseError } from "../error/response-error.js";
export class UserController {
    // ✅ Register — but needs auth & only role 1
    static async register(req, res, next) {
        try {
            // Get requester from token
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                throw new ResponseError(401, "Unauthorized");
            }
            const token = authHeader.substring(7).trim();
            const payload = verifyToken(token);
            const request = req.body;
            const response = await UserService.register(request, payload.userId);
            res.status(201).json({ response });
        }
        catch (error) {
            next(error);
        }
    }
    // ✅ Login
    static async login(req, res, next) {
        try {
            const request = req.body;
            const response = await UserService.login(request);
            res.status(200).json({ response });
        }
        catch (error) {
            next(error);
        }
    }
    // ✅ Get Profile (Who Am I)
    static async getProfile(req, res, next) {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                throw new ResponseError(401, "Unauthorized");
            }
            const token = authHeader.substring(7).trim();
            const payload = verifyToken(token);
            const response = await UserService.getProfile(payload.userId);
            res.status(200).json({ response });
        }
        catch (error) {
            next(error);
        }
    }
    // ✅ List Users
    static async listUsers(req, res, next) {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                throw new ResponseError(401, "Unauthorized");
            }
            const token = authHeader.substring(7).trim();
            const payload = verifyToken(token);
            const response = await UserService.listUsers(payload.userId);
            res.status(200).json({ response });
        }
        catch (error) {
            next(error);
        }
    }
    // ✅ Change Password
    static async changePassword(req, res, next) {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                throw new ResponseError(401, "Unauthorized");
            }
            const token = authHeader.substring(7).trim();
            const payload = verifyToken(token);
            const request = req.body;
            await UserService.changePassword(payload.userId, request);
            res.status(200).json({ message: "Password updated successfully" });
        }
        catch (error) {
            next(error);
        }
    }
    // ✅ Change Role
    static async changeRole(req, res, next) {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                throw new ResponseError(401, "Unauthorized");
            }
            const token = authHeader.substring(7).trim();
            const payload = verifyToken(token);
            const request = req.body;
            await UserService.changeRole(payload.userId, request);
            res.status(200).json({ message: "Role updated successfully" });
        }
        catch (error) {
            next(error);
        }
    }
}
//# sourceMappingURL=user-controller.js.map