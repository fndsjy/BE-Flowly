import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/auth.js";
import { ResponseError } from "../error/response-error.js";
import { JabatanService } from "../service/jabatan-service.js";

export class JabatanController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.access_token;
      if (!token) throw new ResponseError(401, "Unauthorized");

      const payload = verifyToken(token);
      const response = await JabatanService.create(payload.userId, req.body);

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
      const response = await JabatanService.update(payload.userId, req.body);

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
      const response = await JabatanService.softDelete(payload.userId, req.body);

      res.status(200).json({ response });
    } catch (err) {
      next(err);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await JabatanService.list();

      res.status(200).json({ response });
    } catch (err) {
      next(err);
    }
  }
}
