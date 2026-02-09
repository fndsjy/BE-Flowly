import type { Request, Response, NextFunction } from "express";
import type {
  CreateFishboneCategoryRequest,
  UpdateFishboneCategoryRequest,
  DeleteFishboneCategoryRequest,
} from "../model/fishbone-category-model.js";
import { verifyToken } from "../utils/auth.js";
import { ResponseError } from "../error/response-error.js";
import { FishboneCategoryService } from "../service/fishbone-category-service.js";

export class FishboneCategoryController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.access_token;
      if (!token) throw new ResponseError(401, "Unauthorized");

      const payload = verifyToken(token);
      const response = await FishboneCategoryService.create(
        payload.userId,
        req.body as CreateFishboneCategoryRequest
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
      const response = await FishboneCategoryService.update(
        payload.userId,
        req.body as UpdateFishboneCategoryRequest
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
      const response = await FishboneCategoryService.softDelete(
        payload.userId,
        req.body as DeleteFishboneCategoryRequest
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
      const categoryCode = req.query.categoryCode
        ? String(req.query.categoryCode)
        : undefined;

      const filters = categoryCode ? { categoryCode } : undefined;
      const response = await FishboneCategoryService.list(payload.userId, filters);

      res.status(200).json({ response });
    } catch (err) {
      next(err);
    }
  }
}
