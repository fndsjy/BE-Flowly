import type { NextFunction, Request, Response } from "express";
export declare class OnboardingStageController {
    static listCustomerLearning(req: Request, res: Response, next: NextFunction): Promise<void>;
    static listPortalLearning(req: Request, res: Response, next: NextFunction): Promise<void>;
    static recordCustomerLearningFileOpen(req: Request, res: Response, next: NextFunction): Promise<void>;
    static recordPortalLearningFileOpen(req: Request, res: Response, next: NextFunction): Promise<void>;
    static list(req: Request, res: Response, next: NextFunction): Promise<void>;
    static create(req: Request, res: Response, next: NextFunction): Promise<void>;
    static update(req: Request, res: Response, next: NextFunction): Promise<void>;
    static delete(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=onboarding-stage-controller.d.ts.map