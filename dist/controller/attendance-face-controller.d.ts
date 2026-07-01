import type { Request, Response, NextFunction } from "express";
export declare class AttendanceFaceController {
    static listEmployees(req: Request, res: Response, next: NextFunction): Promise<void>;
    static enroll(req: Request, res: Response, next: NextFunction): Promise<void>;
    static deleteProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
    static matchProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
    static recordSuccess(req: Request, res: Response, next: NextFunction): Promise<void>;
    static recordFailure(req: Request, res: Response, next: NextFunction): Promise<void>;
    static listLogs(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=attendance-face-controller.d.ts.map