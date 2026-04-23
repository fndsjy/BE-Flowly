import type { NextFunction, Request, Response } from "express";
export declare class OnboardingMaterialController {
    static listAssignments(req: Request, res: Response, next: NextFunction): Promise<void>;
    static listSourceMaterials(req: Request, res: Response, next: NextFunction): Promise<void>;
    static createAssignment(req: Request, res: Response, next: NextFunction): Promise<void>;
    static deleteAssignment(req: Request, res: Response, next: NextFunction): Promise<void>;
    static download(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=onboarding-material-controller.d.ts.map