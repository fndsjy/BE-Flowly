import type { Request, Response, NextFunction } from "express";
import type { CreateCaseFeedbackCommentRequest } from "../model/case-feedback-comment-model.js";
import { verifyToken } from "../utils/auth.js";
import { ResponseError } from "../error/response-error.js";
import { CaseFeedbackCommentService } from "../service/case-feedback-comment-service.js";

export class CaseFeedbackCommentController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.access_token;
      if (!token) throw new ResponseError(401, "Unauthorized");

      const payload = verifyToken(token);
      const response = await CaseFeedbackCommentService.create(
        payload.userId,
        req.body as CreateCaseFeedbackCommentRequest
      );

      res.status(201).json({ response });
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
      };

      const response = await CaseFeedbackCommentService.list(
        payload.userId,
        Object.keys(filters).length > 0 ? filters : undefined
      );

      res.status(200).json({ response });
    } catch (err) {
      next(err);
    }
  }
}
