import type { Request, Response, NextFunction } from "express";
import type {
  CreateCaseFishboneRequest,
  UpdateCaseFishboneRequest,
  DeleteCaseFishboneRequest,
} from "../model/case-fishbone-model.js";
import { verifyToken } from "../utils/auth.js";
import { ResponseError } from "../error/response-error.js";
import { CaseFishboneService } from "../service/case-fishbone-service.js";

export class CaseFishboneController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.access_token;
      if (!token) throw new ResponseError(401, "Unauthorized");

      const payload = verifyToken(token);
      const response = await CaseFishboneService.create(
        payload.userId,
        req.body as CreateCaseFishboneRequest
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
      const response = await CaseFishboneService.update(
        payload.userId,
        req.body as UpdateCaseFishboneRequest
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
      const response = await CaseFishboneService.softDelete(
        payload.userId,
        req.body as DeleteCaseFishboneRequest
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
        ...(req.query.caseId ? { caseId: String(req.query.caseId) } : {}),
        ...(req.query.sbuSubId ? { sbuSubId: Number(req.query.sbuSubId) } : {}),
        ...(req.query.caseFishboneId
          ? { caseFishboneId: String(req.query.caseFishboneId) }
          : {}),
      };

      if (filters.sbuSubId !== undefined && Number.isNaN(filters.sbuSubId)) {
        throw new ResponseError(400, "Invalid sbuSubId");
      }

      const response = await CaseFishboneService.list(
        payload.userId,
        Object.keys(filters).length > 0 ? filters : undefined
      );

      res.status(200).json({ response });
    } catch (err) {
      next(err);
    }
  }
}
