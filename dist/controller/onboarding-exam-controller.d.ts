import type { NextFunction, Request, Response } from "express";
export declare class OnboardingExamController {
    static listAssignments(req: Request, res: Response, next: NextFunction): Promise<void>;
    static listSourceExams(req: Request, res: Response, next: NextFunction): Promise<void>;
    static createAssignment(req: Request, res: Response, next: NextFunction): Promise<void>;
    static deleteAssignment(req: Request, res: Response, next: NextFunction): Promise<void>;
    static updateStagePassScore(req: Request, res: Response, next: NextFunction): Promise<void>;
    static updateStageTypeOrder(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=onboarding-exam-controller.d.ts.map