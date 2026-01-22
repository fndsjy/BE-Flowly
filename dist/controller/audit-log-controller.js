import { verifyToken } from "../utils/auth.js";
import { ResponseError } from "../error/response-error.js";
import { AuditLogService } from "../service/audit-log-service.js";
export class AuditLogController {
    static async list(req, res, next) {
        try {
            const token = req.cookies.access_token;
            if (!token)
                throw new ResponseError(401, "Unauthorized");
            const payload = verifyToken(token);
            const response = await AuditLogService.list(payload.userId, req.query);
            res.status(200).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
}
//# sourceMappingURL=audit-log-controller.js.map