import type { Request, Response, NextFunction } from "express";
import type {
  CreateMasterIkRequest,
  UpdateMasterIkRequest,
  DeleteMasterIkRequest,
} from "../model/master-ik-model.js";
import { verifyToken } from "../utils/auth.js";
import { ResponseError } from "../error/response-error.js";
import { MasterIkService } from "../service/master-ik-service.js";

export class MasterIkController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.access_token;
      if (!token) throw new ResponseError(401, "Unauthorized");

      const payload = verifyToken(token);
      const response = await MasterIkService.create(
        payload.userId,
        req.body as CreateMasterIkRequest
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
      const response = await MasterIkService.update(
        payload.userId,
        req.body as UpdateMasterIkRequest
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
      const response = await MasterIkService.softDelete(
        payload.userId,
        req.body as DeleteMasterIkRequest
      );

      res.status(200).json({ response });
    } catch (err) {
      next(err);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.access_token;
      if (!token) throw new ResponseError(401, "Unauthorized");

      const payload = verifyToken(token);
      const sopId = req.query.sopId ? String(req.query.sopId) : undefined;

      const filters = sopId ? { sopId } : undefined;
      const response = await MasterIkService.list(payload.userId, filters);

      res.status(200).json({ response });
    } catch (err) {
      next(err);
    }
  }
}
