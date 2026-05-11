import { ResponseError } from "../error/response-error.js";
import { OnboardingStageService } from "../service/onboarding-stage-service.js";
import { CustomerSsoService } from "../service/customer-sso-service.js";
import { getAccessContext } from "../utils/access-scope.js";
import { verifyToken } from "../utils/auth.js";
const ensureCustomerLearningAccess = async (req) => {
    const token = req.cookies.access_token;
    if (token) {
        try {
            const payload = verifyToken(token);
            const accessContext = await getAccessContext(payload.userId);
            if (accessContext.isAdmin) {
                return {
                    bypassProgramFilter: true,
                    custId: null,
                };
            }
        }
        catch {
            // Fall through to customer session support.
        }
    }
    const customerToken = req.cookies?.customer_access_token;
    if (customerToken) {
        try {
            return {
                bypassProgramFilter: false,
                custId: CustomerSsoService.getProfile(customerToken).custid,
            };
        }
        catch {
            // Fall through to normal OMS session support.
        }
    }
    if (!token) {
        throw new ResponseError(401, "Unauthorized");
    }
    throw new ResponseError(403, "Admin access required");
};
export class OnboardingStageController {
    static async listCustomerLearning(req, res, next) {
        try {
            const access = await ensureCustomerLearningAccess(req);
            const response = await OnboardingStageService.listCustomerLearningStages({
                ...access,
                programType: typeof req.query.programType === "string"
                    ? req.query.programType
                    : null,
            });
            res.status(200).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
    static async recordCustomerLearningFileOpen(req, res, next) {
        try {
            const access = await ensureCustomerLearningAccess(req);
            if (access.bypassProgramFilter || !access.custId) {
                res.status(200).json({
                    response: {
                        tracked: false,
                        onboardingMaterialProgressId: null,
                        onboardingAssignmentId: null,
                        onboardingStageProgressId: null,
                        onboardingStageMaterialId: null,
                        sourceFileId: null,
                        status: null,
                        stageStatus: null,
                        readAt: null,
                        lastReadAt: null,
                        openCount: 0,
                    },
                });
                return;
            }
            const response = await OnboardingStageService.recordCustomerLearningFileOpen(access.custId, req.body);
            res.status(200).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
    static async list(req, res, next) {
        try {
            const token = req.cookies.access_token;
            if (!token) {
                throw new ResponseError(401, "Unauthorized");
            }
            const payload = verifyToken(token);
            const response = await OnboardingStageService.list(payload.userId);
            res.status(200).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
    static async create(req, res, next) {
        try {
            const token = req.cookies.access_token;
            if (!token) {
                throw new ResponseError(401, "Unauthorized");
            }
            const payload = verifyToken(token);
            const response = await OnboardingStageService.create(payload.userId, req.body);
            res.status(201).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
    static async update(req, res, next) {
        try {
            const token = req.cookies.access_token;
            if (!token) {
                throw new ResponseError(401, "Unauthorized");
            }
            const payload = verifyToken(token);
            const response = await OnboardingStageService.update(payload.userId, req.body);
            res.status(200).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
    static async delete(req, res, next) {
        try {
            const token = req.cookies.access_token;
            if (!token) {
                throw new ResponseError(401, "Unauthorized");
            }
            const payload = verifyToken(token);
            const response = await OnboardingStageService.delete(payload.userId, req.body);
            res.status(200).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
}
//# sourceMappingURL=onboarding-stage-controller.js.map