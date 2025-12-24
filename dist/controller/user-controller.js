import { UserService } from "../service/user-service.js";
import { verifyToken } from "../utils/auth.js";
import { ResponseError } from "../error/response-error.js";
export class UserController {
    // ✅ Register — but needs auth & only role 1
    static async register(req, res, next) {
        try {
            // Get requester from token
            // const authHeader = req.headers.authorization;
            // if (!authHeader || !authHeader.startsWith("Bearer ")) {
            //   throw new ResponseError(401, "Unauthorized");
            // }
            // const token = authHeader.substring(7).trim();
            // const payload = verifyToken(token);
            const token = req.cookies.access_token;
            if (!token) {
                throw new ResponseError(401, "Unauthorized");
            }
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
            const request = {
                username: req.body?.username,
                badgeNumber: req.body?.badgeNumber ?? req.body?.batchNumber,
                password: req.body?.password,
            };
            const response = await UserService.login(request);
            const token = response.token;
            // Kirim token sebagai HTTP-only cookie
            res.cookie("access_token", token, {
                httpOnly: true,
                secure: false, // ganti ke true kalau sudah pakai HTTPS
                sameSite: "strict",
                maxAge: response.expiresIn * 1000 // detik → ms
            });
            // Jangan kirim token lagi
            const { token: _, ...safeResponse } = response;
            res.status(200).json({ response });
        }
        catch (error) {
            next(error);
        }
    }
    // ✅ Get Profile (Who Am I)
    static async getProfile(req, res, next) {
        try {
            // const authHeader = req.headers.authorization;
            // if (!authHeader || !authHeader.startsWith("Bearer ")) {
            //   throw new ResponseError(401, "Unauthorized");
            // }
            // const token = authHeader.substring(7).trim();
            // const payload = verifyToken(token);
            const token = req.cookies.access_token;
            if (!token) {
                throw new ResponseError(401, "Unauthorized");
            }
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
            // const authHeader = req.headers.authorization;
            // if (!authHeader || !authHeader.startsWith("Bearer ")) {
            //   throw new ResponseError(401, "Unauthorized");
            // }
            // const token = authHeader.substring(7).trim();
            // const payload = verifyToken(token);
            const token = req.cookies.access_token;
            if (!token) {
                throw new ResponseError(401, "Unauthorized");
            }
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
            // const authHeader = req.headers.authorization;
            // if (!authHeader || !authHeader.startsWith("Bearer ")) {
            //   throw new ResponseError(401, "Unauthorized");
            // }
            // const token = authHeader.substring(7).trim();
            // const payload = verifyToken(token);
            const token = req.cookies.access_token;
            if (!token) {
                throw new ResponseError(401, "Unauthorized");
            }
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
            // const authHeader = req.headers.authorization;
            // if (!authHeader || !authHeader.startsWith("Bearer ")) {
            //   throw new ResponseError(401, "Unauthorized");
            // }
            // const token = authHeader.substring(7).trim();
            // const payload = verifyToken(token);
            const token = req.cookies.access_token;
            if (!token) {
                throw new ResponseError(401, "Unauthorized");
            }
            const payload = verifyToken(token);
            const request = req.body;
            await UserService.changeRole(payload.userId, request);
            res.status(200).json({ message: "Role updated successfully" });
        }
        catch (error) {
            next(error);
        }
    }
    // ✅ List Roles
    static async listRoles(req, res, next) {
        try {
            const token = req.cookies.access_token;
            if (!token) {
                throw new ResponseError(401, "Unauthorized");
            }
            const payload = verifyToken(token);
            const response = await UserService.listRoles(payload.userId);
            res.status(200).json({ response });
        }
        catch (error) {
            next(error);
        }
    }
    static async logout(req, res, next) {
        try {
            res.clearCookie("access_token", {
                httpOnly: true,
                secure: false, // Ubah ke true kalau pakai HTTPS
                sameSite: "strict",
                path: "/",
            });
            res.status(200).json({ message: "Logout successful" });
        }
        catch (error) {
            next(error);
        }
    }
}
//# sourceMappingURL=user-controller.js.map