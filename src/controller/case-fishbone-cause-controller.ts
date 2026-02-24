import type { Request, Response, NextFunction } from "express";
import type {
  CreateCaseFishboneCauseRequest,
  UpdateCaseFishboneCauseRequest,
  DeleteCaseFishboneCauseRequest,
} from "../model/case-fishbone-cause-model.js";
import { verifyToken } from "../utils/auth.js";
import { ResponseError } from "../error/response-error.js";
import { CaseFishboneCauseService } from "../service/case-fishbone-cause-service.js";

export class CaseFishboneCauseController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.access_token;
      if (!token) throw new ResponseError(401, "Unauthorized");

      const payload = verifyToken(token);
      const response = await CaseFishboneCauseService.create(
        payload.userId,
        req.body as CreateCaseFishboneCauseRequest
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
      const response = await CaseFishboneCauseService.update(
        payload.userId,
        req.body as UpdateCaseFishboneCauseRequest
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
      const response = await CaseFishboneCauseService.softDelete(
        payload.userId,
        req.body as DeleteCaseFishboneCauseRequest
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

      const filters = {
        ...(req.query.caseFishboneId
          ? { caseFishboneId: String(req.query.caseFishboneId) }
          : {}),
      };

      const response = await CaseFishboneCauseService.list(
        payload.userId,
        Object.keys(filters).length > 0 ? filters : undefined
      );

      res.status(200).json({ response });
    } catch (err) {
      next(err);
    }
  }
}
