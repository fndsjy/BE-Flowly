import { verifyToken } from "../utils/auth.js";
import { ResponseError } from "../error/response-error.js";
import { CaseFeedbackApprovalService } from "../service/case-feedback-approval-service.js";
export class CaseFeedbackApprovalController {
    static async approve(req, res, next) {
        try {
            const token = req.cookies.access_token;
            if (!token)
                throw new ResponseError(401, "Unauthorized");
            const payload = verifyToken(token);
            const response = await CaseFeedbackApprovalService.approve(payload.userId, req.body);
            res.status(200).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
}
//# sourceMappingURL=case-feedback-approval-controller.js.map