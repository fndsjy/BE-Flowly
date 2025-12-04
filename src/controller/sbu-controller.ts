import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/auth.js";
import { ResponseError } from "../error/response-error.js";
import { SbuService } from "../service/sbu-service.js";

export class SbuController {

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.access_token;
      if (!token) throw new ResponseError(401, "Unauthorized");

      const payload = verifyToken(token);
      const response = await SbuService.create(payload.userId, req.body);

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
      const response = await SbuService.update(payload.userId, req.body);

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
      const response = await SbuService.softDelete(payload.userId, req.body);

      res.status(200).json({ response });
    } catch (err) {
      next(err);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await SbuService.list();
      res.status(200).json({ response });
    } catch (err) {
      next(err);
    }
  }

  static async getByPilar(req: Request, res: Response, next: NextFunction) {
    try {
        const pilarId = Number(req.query.pilarId);

        if (isNaN(pilarId)) {
        throw new ResponseError(400, "Invalid pilarId");
        }

        const data = await SbuService.getByPilar(pilarId);

        res.status(200).json({
        success: true,
        message: "Success",
        data
        });
    } catch (e) {
        next(e);
    }
    }
}
