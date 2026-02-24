import type { Request, Response, NextFunction } from "express";
import type {
  CreateCaseDepartmentRequest,
  UpdateCaseDepartmentRequest,
  DeleteCaseDepartmentRequest,
} from "../model/case-department-model.js";
import { verifyToken } from "../utils/auth.js";
import { ResponseError } from "../error/response-error.js";
import { CaseDepartmentService } from "../service/case-department-service.js";

export class CaseDepartmentController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.access_token;
      if (!token) throw new ResponseError(401, "Unauthorized");

      const payload = verifyToken(token);
      const response = await CaseDepartmentService.create(
        payload.userId,
        req.body as CreateCaseDepartmentRequest
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
      const response = await CaseDepartmentService.update(
        payload.userId,
        req.body as UpdateCaseDepartmentRequest
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
      const response = await CaseDepartmentService.softDelete(
        payload.userId,
        req.body as DeleteCaseDepartmentRequest
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
        ...(req.query.caseId ? { caseId: String(req.query.caseId) } : {}),
        ...(req.query.sbuSubId ? { sbuSubId: Number(req.query.sbuSubId) } : {}),
        ...(req.query.decisionStatus
          ? { decisionStatus: String(req.query.decisionStatus).toUpperCase() }
          : {}),
        ...(req.query.assigneeEmployeeId
          ? { assigneeEmployeeId: Number(req.query.assigneeEmployeeId) }
          : {}),
      };

      const numericKeys = ["sbuSubId", "assigneeEmployeeId"] as const;
      for (const key of numericKeys) {
        const value = (filters as Record<string, number | undefined>)[key];
        if (value !== undefined && Number.isNaN(value)) {
          throw new ResponseError(400, `Invalid ${key}`);
        }
      }

      const response = await CaseDepartmentService.list(
        payload.userId,
        Object.keys(filters).length > 0 ? filters : undefined
      );

      res.status(200).json({ response });
    } catch (err) {
      next(err);
    }
  }
}
