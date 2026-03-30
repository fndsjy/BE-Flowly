import type { NextFunction, Request, Response } from "express";
import { ResponseError } from "../error/response-error.js";
import type {
  ChangePasswordRequest,
  ChangeRoleRequest,
  CreateUserRequest,
  LoginRequest,
  UpdateProfileRequest,
} from "../model/user-model.js";
import { UserService } from "../service/user-service.js";
import { verifyToken } from "../utils/auth.js";

export class UserController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.access_token;
      if (!token) {
        throw new ResponseError(401, "Unauthorized");
      }

      const payload = verifyToken(token);
      const request: CreateUserRequest = req.body as CreateUserRequest;
      const response = await UserService.register(request, payload.userId);

      res.status(201).json({ response });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const request: LoginRequest = {
        username: req.body?.username,
        cardNo:
          req.body?.cardNo ??
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
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.access_token;
      if (!token) {
        throw new ResponseError(401, "Unauthorized");
      }

      const payload = verifyToken(token);
      const response = await UserService.getProfile(payload.userId);

      res.status(200).json({ response });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.access_token;
      if (!token) {
        throw new ResponseError(401, "Unauthorized");
      }

      const payload = verifyToken(token);
      const request: UpdateProfileRequest = req.body as UpdateProfileRequest;
      const response = await UserService.updateProfile(payload.userId, request);

      res.status(200).json({ response });
    } catch (error) {
      next(error);
    }
  }

  static async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.access_token;
      if (!token) {
        throw new ResponseError(401, "Unauthorized");
      }

      const payload = verifyToken(token);
      const response = await UserService.listUsers(payload.userId);

      res.status(200).json({ response });
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.access_token;
      if (!token) {
        throw new ResponseError(401, "Unauthorized");
      }

      const payload = verifyToken(token);
      const request: ChangePasswordRequest = req.body as ChangePasswordRequest;
      await UserService.changePassword(payload.userId, request);

      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      next(error);
    }
  }

  static async changeRole(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.access_token;
      if (!token) {
        throw new ResponseError(401, "Unauthorized");
      }

      const payload = verifyToken(token);
      const request: ChangeRoleRequest = req.body as ChangeRoleRequest;
      await UserService.changeRole(payload.userId, request);

      res.status(200).json({ message: "Role updated successfully" });
    } catch (error) {
      next(error);
    }
  }

  static async listRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.access_token;
      if (!token) {
        throw new ResponseError(401, "Unauthorized");
      }

      const payload = verifyToken(token);
      const response = await UserService.listRoles(payload.userId);

      res.status(200).json({ response });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie("access_token", {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        path: "/",
      });

      res.status(200).json({ message: "Logout successful" });
    } catch (error) {
      next(error);
    }
  }
}
