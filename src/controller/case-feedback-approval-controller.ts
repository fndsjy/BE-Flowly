import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/auth.js";
import { ResponseError } from "../error/response-error.js";
import { CaseFeedbackApprovalService } from "../service/case-feedback-approval-service.js";

export class CaseFeedbackApprovalController {
  static async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.access_token;
      if (!token) throw new ResponseError(401, "Unauthorized");

      const payload = verifyToken(token);
      const response = await CaseFeedbackApprovalService.approve(
        payload.userId,
        req.body as { caseId: string }
      );

      res.status(200).json({ response });
    } catch (err) {
      next(err);
    }
  }
}
