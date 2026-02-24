import type { Request, Response, NextFunction } from "express";
export declare class CaseAttachmentController {
    static create(req: Request, res: Response, next: NextFunction): Promise<void>;
    static update(req: Request, res: Response, next: NextFunction): Promise<void>;
    static softDelete(req: Request, res: Response, next: NextFunction): Promise<void>;
    static list(req: Request, res: Response, next: NextFunction): Promise<void>;
    static download(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=case-attachment-controller.d.ts.map