import type { Request, Response, NextFunction } from "express";
import type {
  CreateMasterAccessRoleRequest,
  UpdateMasterAccessRoleRequest,
  DeleteMasterAccessRoleRequest
} from "../model/master-access-role-model.js";
import { verifyToken } from "../utils/auth.js";
import { ResponseError } from "../error/response-error.js";
import { MasterAccessRoleService } from "../service/master-access-role-service.js";

export class MasterAccessRoleController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.access_token;
      if (!token) throw new ResponseError(401, "Unauthorized");

      const payload = verifyToken(token);
      const response = await MasterAccessRoleService.create(
        payload.userId,
        req.body as CreateMasterAccessRoleRequest
      );

      res.status(201).json({ response });
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.access_token;
      if (!token) throw new ResponseError(401, "Unauthorized");

      const payload = verifyToken(token);
      const response = await MasterAccessRoleService.update(
        payload.userId,
        req.body as UpdateMasterAccessRoleRequest
      );

      res.status(200).json({ response });
    } catch (err) {
      next(err);
    }
  }

  static async softDelete(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.access_token;
      if (!token) throw new ResponseError(401, "Unauthorized");

      const payload = verifyToken(token);
      const response = await MasterAccessRoleService.softDelete(
        payload.userId,
        req.body as DeleteMasterAccessRoleRequest
      );

      res.status(200).json({ response });
    } catch (err) {
      next(err);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const resourceType = typeof req.query.resourceType === "string"
        ? req.query.resourceType
        : undefined;

      const parentKey = typeof req.query.parentKey === "string"
        ? req.query.parentKey
        : undefined;

      const response = await MasterAccessRoleService.list(resourceType, parentKey);
      res.status(200).json({ response });
    } catch (err) {
      next(err);
    }
  }
}
