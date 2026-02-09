import type { Request, Response, NextFunction } from "express";
export declare class FishboneController {
    static create(req: Request, res: Response, next: NextFunction): Promise<void>;
    static update(req: Request, res: Response, next: NextFunction): Promise<void>;
    static softDelete(req: Request, res: Response, next: NextFunction): Promise<void>;
    static list(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=fishbone-controller.d.ts.map