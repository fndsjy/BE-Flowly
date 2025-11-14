import type { Request, Response, NextFunction } from "express";
export declare class ApplicationController {
    static handleGetRoot(req: Request, res: Response): void;
    static handleNotFound(req: Request, res: Response, next: NextFunction): void;
    static handleError(err: Error & {
        status?: number;
        details?: any;
    }, req: Request, res: Response, next: NextFunction): void;
    static getOffsetFromRequest(req: Request): number;
    static buildPaginationObject(req: Request, count: number): {
        page: number;
        pageCount: number;
        pageSize: number;
        count: number;
    };
}
//# sourceMappingURL=app-controller.d.ts.map