import type { Request, Response, NextFunction } from "express";
export declare class ChartMemberController {
    static update(req: Request, res: Response, next: NextFunction): Promise<void>;
    static softDelete(req: Request, res: Response, next: NextFunction): Promise<void>;
    static list(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=chart-member-controller.d.ts.map