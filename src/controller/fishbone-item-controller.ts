import type { Request, Response, NextFunction } from "express";
import type {
  CreateFishboneItemRequest,
  UpdateFishboneItemRequest,
  DeleteFishboneItemRequest,
} from "../model/fishbone-item-model.js";
import { verifyToken } from "../utils/auth.js";
import { ResponseError } from "../error/response-error.js";
import { FishboneItemService } from "../service/fishbone-item-service.js";

export class FishboneItemController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.access_token;
      if (!token) throw new ResponseError(401, "Unauthorized");

      const payload = verifyToken(token);
      const response = await FishboneItemService.create(
        payload.userId,
        req.body as CreateFishboneItemRequest
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
      const response = await FishboneItemService.update(
        payload.userId,
        req.body as UpdateFishboneItemRequest
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
      const response = await FishboneItemService.softDelete(
        payload.userId,
        req.body as DeleteFishboneItemRequest
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
      const fishboneId = req.query.fishboneId
        ? String(req.query.fishboneId)
        : undefined;
      const categoryCode = req.query.categoryCode
        ? String(req.query.categoryCode)
        : undefined;

      const filters = {
        ...(fishboneId ? { fishboneId } : {}),
        ...(categoryCode ? { categoryCode } : {}),
      };

      const response = await FishboneItemService.list(
        payload.userId,
        Object.keys(filters).length > 0 ? filters : undefined
      );

      res.status(200).json({ response });
    } catch (err) {
      next(err);
    }
  }
}
