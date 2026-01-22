import type { Request, Response, NextFunction } from "express";
import type {
  CreateProcedureIkRequest,
  UpdateProcedureIkRequest,
  DeleteProcedureIkRequest,
} from "../model/procedure-ik-model.js";
import { verifyToken } from "../utils/auth.js";
import { ResponseError } from "../error/response-error.js";
import { ProcedureIkService } from "../service/procedure-ik-service.js";

export class ProcedureIkController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.access_token;
      if (!token) throw new ResponseError(401, "Unauthorized");

      const payload = verifyToken(token);
      const response = await ProcedureIkService.create(
        payload.userId,
        req.body as CreateProcedureIkRequest
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
      const response = await ProcedureIkService.update(
        payload.userId,
        req.body as UpdateProcedureIkRequest
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
      const response = await ProcedureIkService.softDelete(
        payload.userId,
        req.body as DeleteProcedureIkRequest
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
      const response = await ProcedureIkService.list(payload.userId, filters);

      res.status(200).json({ response });
    } catch (err) {
      next(err);
    }
  }
}
