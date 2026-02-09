import type { Request, Response, NextFunction } from "express";
import type {
  CreateFishboneRequest,
  UpdateFishboneRequest,
  DeleteFishboneRequest,
} from "../model/fishbone-model.js";
import { verifyToken } from "../utils/auth.js";
import { ResponseError } from "../error/response-error.js";
import { FishboneService } from "../service/fishbone-service.js";

export class FishboneController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.access_token;
      if (!token) throw new ResponseError(401, "Unauthorized");

      const payload = verifyToken(token);
      const response = await FishboneService.create(
        payload.userId,
        req.body as CreateFishboneRequest
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
      const response = await FishboneService.update(
        payload.userId,
        req.body as UpdateFishboneRequest
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
      const response = await FishboneService.softDelete(
        payload.userId,
        req.body as DeleteFishboneRequest
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
      const sbuSubId = req.query.sbuSubId
        ? Number(req.query.sbuSubId)
        : undefined;

      if (req.query.sbuSubId !== undefined && isNaN(Number(req.query.sbuSubId))) {
        throw new ResponseError(400, "Invalid sbuSubId");
      }

      const filters = {
        ...(fishboneId ? { fishboneId } : {}),
        ...(sbuSubId !== undefined ? { sbuSubId } : {}),
      };

      const response = await FishboneService.list(
        payload.userId,
        Object.keys(filters).length > 0 ? filters : undefined
      );

      res.status(200).json({ response });
    } catch (err) {
      next(err);
    }
  }
}
