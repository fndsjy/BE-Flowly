import type { Request, Response, NextFunction } from "express";
import type {
  CreatePilarRequest,
  UpdatePilarRequest,
  DeletePilarRequest
} from "../model/pilar-model.js";
import { verifyToken } from "../utils/auth.js";
import { ResponseError } from "../error/response-error.js";
import { PilarService } from "../service/pilar-service.js";

export class PilarController {

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.access_token;
      if (!token) throw new ResponseError(401, "Unauthorized");

      const payload = verifyToken(token);
      const response = await PilarService.create(payload.userId, req.body as CreatePilarRequest);

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
      const response = await PilarService.update(payload.userId, req.body as UpdatePilarRequest);

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
      const response = await PilarService.softDelete(payload.userId, req.body as DeletePilarRequest);

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
      const response = await PilarService.list(payload.userId);
      res.status(200).json({ response });
    } catch (err) {
      next(err);
    }
  }
}
