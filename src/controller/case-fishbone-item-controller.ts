import type { Request, Response, NextFunction } from "express";
import type {
  CreateCaseFishboneItemRequest,
  UpdateCaseFishboneItemRequest,
  DeleteCaseFishboneItemRequest,
} from "../model/case-fishbone-item-model.js";
import { verifyToken } from "../utils/auth.js";
import { ResponseError } from "../error/response-error.js";
import { CaseFishboneItemService } from "../service/case-fishbone-item-service.js";

export class CaseFishboneItemController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.access_token;
      if (!token) throw new ResponseError(401, "Unauthorized");

      const payload = verifyToken(token);
      const response = await CaseFishboneItemService.create(
        payload.userId,
        req.body as CreateCaseFishboneItemRequest
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
      const response = await CaseFishboneItemService.update(
        payload.userId,
        req.body as UpdateCaseFishboneItemRequest
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
      const response = await CaseFishboneItemService.softDelete(
        payload.userId,
        req.body as DeleteCaseFishboneItemRequest
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
        ...(req.query.categoryCode
          ? { categoryCode: String(req.query.categoryCode) }
          : {}),
      };

      const response = await CaseFishboneItemService.list(
        payload.userId,
        Object.keys(filters).length > 0 ? filters : undefined
      );

      res.status(200).json({ response });
    } catch (err) {
      next(err);
    }
  }
}
