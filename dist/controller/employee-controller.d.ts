import type { Request, Response, NextFunction } from "express";
export declare class EmployeeController {
    static create(req: Request, res: Response, next: NextFunction): Promise<void>;
    static update(req: Request, res: Response, next: NextFunction): Promise<void>;
    static remove(req: Request, res: Response, next: NextFunction): Promise<void>;
    static listForPIC(req: Request, res: Response, next: NextFunction): Promise<void>;
    static listDepartments(req: Request, res: Response, next: NextFunction): Promise<void>;
    static listFingerMachines(req: Request, res: Response, next: NextFunction): Promise<void>;
    static updateJobDesc(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=employee-controller.d.ts.map