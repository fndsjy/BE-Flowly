import type { Request, Response, NextFunction } from "express";
import { ResponseError } from "../error/response-error.js";
import { verifyToken } from "../utils/auth.js";
import { OrgChartService } from "../service/orgchart-service.js";

export class OrgChartController {

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.access_token;
      if (!token) throw new ResponseError(401, "Unauthorized");
      const payload = verifyToken(token);

      const response = await OrgChartService.create(payload.userId, req.body);
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

      const response = await OrgChartService.update(payload.userId, req.body);
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

      await OrgChartService.softDelete(payload.userId, req.body);
      res.status(200).json({ message: "OrgChart node deleted" });
    } catch (err) {
      next(err);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      // semua boleh, tidak butuh check role
      const response = await OrgChartService.listTree();
      res.status(200).json({ response });
    } catch (err) {
      next(err);
    }
  }

  static async listStructure(req: Request, res: Response, next: NextFunction) {
    try {
      const { structureId } = req.query; // <— AMBIL DARI QUERY

      if (structureId) {
        const result = await OrgChartService.listByStructure(String(structureId));
        return res.status(200).json({ response: result });
      }

      // default return all tree
      const result = await OrgChartService.listTree();
      return res.status(200).json({ response: result });

    } catch (error) {
      next(error);
    }
  }
}
