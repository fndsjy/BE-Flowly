import type { Request, Response, NextFunction } from "express";
export declare class SbuSubController {
    static create(req: Request, res: Response, next: NextFunction): Promise<void>;
    static update(req: Request, res: Response, next: NextFunction): Promise<void>;
    static softDelete(req: Request, res: Response, next: NextFunction): Promise<void>;
    static list(req: Request, res: Response, next: NextFunction): Promise<void>;
    static listPublic(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getBySbu(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getByPilar(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=sbu-sub-controller.d.ts.map