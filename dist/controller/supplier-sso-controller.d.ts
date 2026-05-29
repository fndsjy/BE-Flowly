import type { NextFunction, Request, Response } from "express";
export declare class SupplierSsoController {
    static login(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
    static logout(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=supplier-sso-controller.d.ts.map