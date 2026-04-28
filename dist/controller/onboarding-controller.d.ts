import type { NextFunction, Request, Response } from "express";
export declare class OnboardingController {
    static listAdminMonitoring(req: Request, res: Response, next: NextFunction): Promise<void>;
    static listMyWorkspace(req: Request, res: Response, next: NextFunction): Promise<void>;
    static listEmployeeSummary(req: Request, res: Response, next: NextFunction): Promise<void>;
    static startEmployees(req: Request, res: Response, next: NextFunction): Promise<void>;
    static startExam(req: Request, res: Response, next: NextFunction): Promise<void>;
    static saveExamAnswer(req: Request, res: Response, next: NextFunction): Promise<void>;
    static recordExamWarning(req: Request, res: Response, next: NextFunction): Promise<void>;
    static submitExam(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=onboarding-controller.d.ts.map