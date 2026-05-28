import { ResponseError } from "../error/response-error.js";
import { OnboardingStageService } from "../service/onboarding-stage-service.js";
import { CustomerSsoService } from "../service/customer-sso-service.js";
import { getAccessContext } from "../utils/access-scope.js";
import { verifyToken } from "../utils/auth.js";
const normalizeQueryText = (value) => typeof value === "string" && value.trim() ? value.trim() : null;
const resolvePortalKey = (req, fallback) => {
    const portalKey = normalizeQueryText(req.query.portalKey)?.toUpperCase() ?? fallback;
    if (portalKey !== "CUSTOMER" && portalKey !== "SUPPLIER") {
        throw new ResponseError(400, "Portal learning tidak valid");
    }
    return portalKey;
};
const ensurePortalLearningAccess = async (req, fallbackPortalKey = "CUSTOMER") => {
    const portalKey = resolvePortalKey(req, fallbackPortalKey);
    const token = req.cookies.access_token;
    if (token) {
        try {
            const payload = verifyToken(token);
            const accessContext = await getAccessContext(payload.userId);
            if (accessContext.isAdmin) {
                return {
                    portalKey,
                    bypassProgramFilter: true,
                    custId: null,
                    participantReferenceId: null,
                    participantReferenceType: portalKey,
                    canDownloadOriginal: true,
                };
            }
            if (portalKey === "SUPPLIER") {
                return {
                    portalKey,
                    bypassProgramFilter: false,
                    custId: null,
                    participantReferenceId: payload.userId,
                    participantReferenceType: "SUPPLIER",
                    canDownloadOriginal: false,
                };
            }
            return {
                portalKey,
                bypassProgramFilter: true,
                custId: null,
                participantReferenceId: null,
                participantReferenceType: portalKey,
                canDownloadOriginal: false,
            };
        }
        catch {
            // Fall through to customer session support.
        }
    }
    const customerToken = req.cookies?.customer_access_token;
    if (portalKey === "CUSTOMER" && customerToken) {
        try {
            const profile = CustomerSsoService.getProfile(customerToken);
            return {
                portalKey,
                bypassProgramFilter: false,
                custId: profile.custid,
                participantReferenceId: profile.custid,
                participantReferenceType: "CUSTOMER",
                canDownloadOriginal: false,
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
const untrackedLearningOpenResponse = {
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
};
export class OnboardingStageController {
    static async listCustomerLearning(req, res, next) {
        try {
            const access = await ensurePortalLearningAccess(req, "CUSTOMER");
            const response = await OnboardingStageService.listCustomerLearningStages({
                ...access,
                programType: normalizeQueryText(req.query.programType),
            });
            res.status(200).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
    static async listPortalLearning(req, res, next) {
        try {
            const access = await ensurePortalLearningAccess(req, "CUSTOMER");
            const response = await OnboardingStageService.listCustomerLearningStages({
                ...access,
                programType: normalizeQueryText(req.query.programType),
            });
            res.status(200).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
    static async recordCustomerLearningFileOpen(req, res, next) {
        try {
            const access = await ensurePortalLearningAccess(req, "CUSTOMER");
            if (access.bypassProgramFilter || !access.participantReferenceId) {
                res.status(200).json({ response: untrackedLearningOpenResponse });
                return;
            }
            const response = await OnboardingStageService.recordCustomerLearningFileOpen(access.participantReferenceId, {
                ...req.body,
                portalKey: access.portalKey,
                participantReferenceType: access.participantReferenceType,
            });
            res.status(200).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
    static async recordPortalLearningFileOpen(req, res, next) {
        try {
            const access = await ensurePortalLearningAccess(req, "CUSTOMER");
            if (access.bypassProgramFilter || !access.participantReferenceId) {
                res.status(200).json({ response: untrackedLearningOpenResponse });
                return;
            }
            const response = await OnboardingStageService.recordCustomerLearningFileOpen(access.participantReferenceId, {
                ...req.body,
                portalKey: access.portalKey,
                participantReferenceType: access.participantReferenceType,
            });
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