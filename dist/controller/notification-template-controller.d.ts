import type { NextFunction, Request, Response } from "express";
export declare class NotificationTemplateController {
    static failedMessages(req: Request, res: Response, next: NextFunction): Promise<void>;
    static retryFailedMessage(req: Request, res: Response, next: NextFunction): Promise<void>;
    static create(req: Request, res: Response, next: NextFunction): Promise<void>;
    static update(req: Request, res: Response, next: NextFunction): Promise<void>;
    static softDelete(req: Request, res: Response, next: NextFunction): Promise<void>;
    static sendWhatsappTest(req: Request, res: Response, next: NextFunction): Promise<void>;
    static listManualRecipients(req: Request, res: Response, next: NextFunction): Promise<void>;
    static sendManual(req: Request, res: Response, next: NextFunction): Promise<void>;
    static list(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=notification-template-controller.d.ts.map