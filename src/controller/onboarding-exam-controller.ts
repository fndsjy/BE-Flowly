import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/auth.js";
import { ResponseError } from "../error/response-error.js";
import { OnboardingExamService } from "../service/onboarding-exam-service.js";

export class OnboardingExamController {
  static async listAssignments(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.access_token;
      if (!token) {
        throw new ResponseError(401, "Unauthorized");
      }

      const payload = verifyToken(token);
      const response = await OnboardingExamService.listAssignments(payload.userId);

      res.status(200).json({ response });
    } catch (err) {
      next(err);
    }
  }

  static async listSourceExams(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.access_token;
      if (!token) {
        throw new ResponseError(401, "Unauthorized");
      }

      verifyToken(token);
      const response = await OnboardingExamService.listSourceExams();

      res.status(200).json({ response });
    } catch (err) {
      next(err);
    }
  }

  static async createAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.access_token;
      if (!token) {
        throw new ResponseError(401, "Unauthorized");
      }

      const payload = verifyToken(token);
      const response = await OnboardingExamService.createAssignment(
        payload.userId,
        req.body
      );

      res.status(201).json({ response });
    } catch (err) {
      next(err);
    }
  }

  static async deleteAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.access_token;
      if (!token) {
        throw new ResponseError(401, "Unauthorized");
      }

      const payload = verifyToken(token);
      const response = await OnboardingExamService.deleteAssignment(
        payload.userId,
        req.body
      );

      res.status(200).json({ response });
    } catch (err) {
      next(err);
    }
  }

  static async updateStagePassScore(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.access_token;
      if (!token) {
        throw new ResponseError(401, "Unauthorized");
      }

      const payload = verifyToken(token);
      const response = await OnboardingExamService.updateStagePassScore(
        payload.userId,
        req.body
      );

      res.status(200).json({ response });
    } catch (err) {
      next(err);
    }
  }

  static async updateStageTypeOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.access_token;
      if (!token) {
        throw new ResponseError(401, "Unauthorized");
      }

      const payload = verifyToken(token);
      const response = await OnboardingExamService.updateStageTypeOrder(
        payload.userId,
        req.body
      );

      res.status(200).json({ response });
    } catch (err) {
      next(err);
    }
  }
}
