// sbu-sub-controller.ts
import type { Request, Response, NextFunction } from "express";
import type {
  CreateSbuSubRequest,
  UpdateSbuSubRequest,
  DeleteSbuSubRequest
} from "../model/sbu-sub-model.js";
import { verifyToken } from "../utils/auth.js";
import { ResponseError } from "../error/response-error.js";
import { SbuSubService } from "../service/sbu-sub-service.js";

export class SbuSubController {

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.access_token;
      if (!token) throw new ResponseError(401, "Unauthorized");

      const payload = verifyToken(token);
      const response = await SbuSubService.create(payload.userId, req.body as CreateSbuSubRequest);

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
      const response = await SbuSubService.update(payload.userId, req.body as UpdateSbuSubRequest);

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
      const response = await SbuSubService.softDelete(payload.userId, req.body as DeleteSbuSubRequest);

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
      const response = await SbuSubService.list(payload.userId);
      res.status(200).json({ response });
    } catch (err) {
      next(err);
    }
  }

  static async listPublic(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.access_token;
      if (!token) throw new ResponseError(401, "Unauthorized");

      const payload = verifyToken(token);
      const response = await SbuSubService.listPublic(payload.userId);
      res.status(200).json({ response });
    } catch (err) {
      next(err);
    }
  }

  static async getBySbu(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.access_token;
      if (!token) throw new ResponseError(401, "Unauthorized");

      const payload = verifyToken(token);
      const sbuId = Number(req.query.sbuId);
      if (isNaN(sbuId)) throw new ResponseError(400, "Invalid sbuId");

      const data = await SbuSubService.getBySbu(payload.userId, sbuId);

      res.status(200).json({ success: true, message: "Success", data });
    } catch (err) {
      next(err);
    }
  }

  static async getByPilar(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.access_token;
      if (!token) throw new ResponseError(401, "Unauthorized");

      const payload = verifyToken(token);
      const pilarId = Number(req.query.pilarId);
      if (isNaN(pilarId)) throw new ResponseError(400, "Invalid pilarId");

      const data = await SbuSubService.getByPilar(payload.userId, pilarId);

      res.status(200).json({ success: true, message: "Success", data });
    } catch (err) {
      next(err);
    }
  }

}
