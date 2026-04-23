import { ResponseError } from "../error/response-error.js";
import { verifyToken } from "../utils/auth.js";
import { OnboardingService } from "../service/onboarding-service.js";
export class OnboardingController {
    static async listAdminMonitoring(req, res, next) {
        try {
            const token = req.cookies.access_token;
            if (!token)
                throw new ResponseError(401, "Unauthorized");
            const payload = verifyToken(token);
            const response = await OnboardingService.listAdminMonitoring(payload.userId);
            res.status(200).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
    static async listMyWorkspace(req, res, next) {
        try {
            const token = req.cookies.access_token;
            if (!token)
                throw new ResponseError(401, "Unauthorized");
            const payload = verifyToken(token);
            const response = await OnboardingService.listMyWorkspace(payload.userId);
            res.status(200).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
    static async listEmployeeSummary(req, res, next) {
        try {
            const token = req.cookies.access_token;
            if (!token)
                throw new ResponseError(401, "Unauthorized");
            const payload = verifyToken(token);
            const response = await OnboardingService.listEmployeeSummary(payload.userId, req.query);
            res.status(200).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
    static async startEmployees(req, res, next) {
        try {
            const token = req.cookies.access_token;
            if (!token)
                throw new ResponseError(401, "Unauthorized");
            const payload = verifyToken(token);
            const response = await OnboardingService.startEmployees(payload.userId, req.body);
            res.status(201).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
}
//# sourceMappingURL=onboarding-controller.js.map