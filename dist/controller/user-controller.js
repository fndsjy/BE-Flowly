import { ResponseError } from "../error/response-error.js";
import { UserService } from "../service/user-service.js";
import { verifyToken } from "../utils/auth.js";
export class UserController {
    static async register(req, res, next) {
        try {
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
    static async login(req, res, next) {
        try {
            const request = {
                username: req.body?.username,
                cardNo: req.body?.cardNo ??
                    req.body?.cardNumber ??
                    req.body?.badgeNumber ??
                    req.body?.batchNumber,
                password: req.body?.password,
            };
            const response = await UserService.login(request);
            res.cookie("access_token", response.token, {
                httpOnly: true,
                secure: false,
                sameSite: "strict",
                maxAge: response.expiresIn * 1000,
            });
            res.status(200).json({ response });
        }
        catch (error) {
            next(error);
        }
    }
    static async getProfile(req, res, next) {
        try {
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
    static async updateProfile(req, res, next) {
        try {
            const token = req.cookies.access_token;
            if (!token) {
                throw new ResponseError(401, "Unauthorized");
            }
            const payload = verifyToken(token);
            const request = req.body;
            const response = await UserService.updateProfile(payload.userId, request);
            res.status(200).json({ response });
        }
        catch (error) {
            next(error);
        }
    }
    static async listUsers(req, res, next) {
        try {
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
    static async changePassword(req, res, next) {
        try {
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
    static async changeRole(req, res, next) {
        try {
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
                secure: false,
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