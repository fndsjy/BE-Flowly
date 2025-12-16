import type { Request, Response, NextFunction } from "express";
export declare class ChartController {
    static create(req: Request, res: Response, next: NextFunction): Promise<void>;
    static update(req: Request, res: Response, next: NextFunction): Promise<void>;
    static softDelete(req: Request, res: Response, next: NextFunction): Promise<void>;
    static list(req: Request, res: Response, next: NextFunction): Promise<void>;
    static listBySbuSub(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=chart-controller.d.ts.map