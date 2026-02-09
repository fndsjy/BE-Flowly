import type { Request, Response, NextFunction } from "express";
import type {
  CreateFishboneCauseRequest,
  UpdateFishboneCauseRequest,
  DeleteFishboneCauseRequest,
} from "../model/fishbone-cause-model.js";
import { verifyToken } from "../utils/auth.js";
import { ResponseError } from "../error/response-error.js";
import { FishboneCauseService } from "../service/fishbone-cause-service.js";

export class FishboneCauseController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.access_token;
      if (!token) throw new ResponseError(401, "Unauthorized");

      const payload = verifyToken(token);
      const response = await FishboneCauseService.create(
        payload.userId,
        req.body as CreateFishboneCauseRequest
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
      const response = await FishboneCauseService.update(
        payload.userId,
        req.body as UpdateFishboneCauseRequest
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
      const response = await FishboneCauseService.softDelete(
        payload.userId,
        req.body as DeleteFishboneCauseRequest
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

      const filters = fishboneId ? { fishboneId } : undefined;
      const response = await FishboneCauseService.list(payload.userId, filters);

      res.status(200).json({ response });
    } catch (err) {
      next(err);
    }
  }
}
