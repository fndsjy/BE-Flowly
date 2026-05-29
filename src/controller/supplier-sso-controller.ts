import type { NextFunction, Request, Response } from "express";
import { SupplierSsoService } from "../service/supplier-sso-service.js";

const SUPPLIER_COOKIE_NAME = "supplier_access_token";

const supplierCookieOptions = {
  httpOnly: true,
  secure: false,
  sameSite: "strict" as const,
  path: "/",
};

export class SupplierSsoController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await SupplierSsoService.login(req.body?.token);

      res.cookie(SUPPLIER_COOKIE_NAME, response.token, {
        ...supplierCookieOptions,
        maxAge: response.expiresIn * 1000,
      });

      res.status(200).json({
        response: {
          supplierId: response.supplierId,
          expiresIn: response.expiresIn,
          data: response.data,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const response = SupplierSsoService.getProfile(
        req.cookies?.[SUPPLIER_COOKIE_NAME]
      );

      res.status(200).json({ response });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      SupplierSsoService.logout(req.cookies?.[SUPPLIER_COOKIE_NAME]);
      res.clearCookie(SUPPLIER_COOKIE_NAME, supplierCookieOptions);
      res.status(200).json({ message: "Supplier logout successful" });
    } catch (error) {
      next(error);
    }
  }
}
