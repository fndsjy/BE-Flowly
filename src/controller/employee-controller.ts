import type { Request, Response, NextFunction } from "express";
import { EmployeeService } from "../service/employee-service.js";
import { verifyToken } from "../utils/auth.js";
import { ResponseError } from "../error/response-error.js";

export class EmployeeController {
  static async listForPIC(req: Request, res: Response, next: NextFunction) {
    try {
      // // 1. Ambil token dari cookie
      // const token = req.cookies.access_token;
      // if (!token) throw new ResponseError(401, "Unauthorized");

      // // 2. Decode & ambil userId
      // const payload = verifyToken(token);
      // if (!payload) throw new ResponseError(401, "Unauthorized");

      // 3. Panggil service
      const response = await EmployeeService.listForPIC();

      res.status(200).json({ response });
    } catch (err) {
      next(err);
    }
  }

  static async updateJobDesc(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.access_token;
      if (!token) throw new ResponseError(401, "Unauthorized");

      const payload = verifyToken(token);

      const response = await EmployeeService.updateJobDesc(payload.userId, req.body);
      res.status(200).json({ response });
    } catch (err) {
      next(err);
    }
  }
}
