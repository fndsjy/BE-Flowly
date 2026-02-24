import { verifyToken } from "../utils/auth.js";
import { ResponseError } from "../error/response-error.js";
import { CaseNotificationTemplateService } from "../service/case-notification-template-service.js";
const parseBoolean = (value) => {
    if (value === undefined || value === null)
        return undefined;
    const normalized = String(value).trim().toLowerCase();
    if (normalized === "true")
        return true;
    if (normalized === "false")
        return false;
    return undefined;
};
export class CaseNotificationTemplateController {
    static async create(req, res, next) {
        try {
            const token = req.cookies.access_token;
            if (!token)
                throw new ResponseError(401, "Unauthorized");
            const payload = verifyToken(token);
            const response = await CaseNotificationTemplateService.create(payload.userId, req.body);
            res.status(201).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
    static async update(req, res, next) {
        try {
            const token = req.cookies.access_token;
            if (!token)
                throw new ResponseError(401, "Unauthorized");
            const payload = verifyToken(token);
            const response = await CaseNotificationTemplateService.update(payload.userId, req.body);
            res.status(200).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
    static async softDelete(req, res, next) {
        try {
            const token = req.cookies.access_token;
            if (!token)
                throw new ResponseError(401, "Unauthorized");
            const payload = verifyToken(token);
            const response = await CaseNotificationTemplateService.softDelete(payload.userId, req.body);
            res.status(200).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
    static async list(req, res, next) {
        try {
            const token = req.cookies.access_token;
            if (!token)
                throw new ResponseError(401, "Unauthorized");
            const payload = verifyToken(token);
            const filters = {};
            if (req.query.channel) {
                filters.channel = String(req.query.channel);
            }
            if (req.query.role) {
                filters.role = String(req.query.role);
            }
            if (req.query.action !== undefined) {
                const actionValue = String(req.query.action);
                filters.action = actionValue.length > 0 ? actionValue : "";
            }
            if (req.query.caseType !== undefined) {
                const caseTypeValue = String(req.query.caseType);
                filters.caseType = caseTypeValue.length > 0 ? caseTypeValue : "";
            }
            const isActive = parseBoolean(req.query.isActive);
            if (isActive !== undefined) {
                filters.isActive = isActive;
            }
            const response = await CaseNotificationTemplateService.list(payload.userId, Object.keys(filters).length > 0 ? filters : undefined);
            res.status(200).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
}
//# sourceMappingURL=case-notification-template-controller.js.map