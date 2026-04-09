import { ResponseError } from "../error/response-error.js";
import { OnboardingMaterialAssignmentService } from "../service/onboarding-material-assignment-service.js";
import { verifyToken } from "../utils/auth.js";
export class OnboardingMaterialAssignmentController {
    static async list(req, res, next) {
        try {
            const token = req.cookies.access_token;
            if (!token) {
                throw new ResponseError(401, "Unauthorized");
            }
            const payload = verifyToken(token);
            const response = await OnboardingMaterialAssignmentService.list(payload.userId, req.query);
            res.status(200).json({ response });
        }
        catch (error) {
            next(error);
        }
    }
}
//# sourceMappingURL=onboarding-material-assignment-controller.js.map