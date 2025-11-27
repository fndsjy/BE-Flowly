import type { Request, Response, NextFunction } from "express";
export declare class UserController {
    static register(req: Request, res: Response, next: NextFunction): Promise<void>;
    static login(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
    static listUsers(req: Request, res: Response, next: NextFunction): Promise<void>;
    static changePassword(req: Request, res: Response, next: NextFunction): Promise<void>;
    static changeRole(req: Request, res: Response, next: NextFunction): Promise<void>;
    static listRoles(req: Request, res: Response, next: NextFunction): Promise<void>;
    static logout(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=user-controller.d.ts.map