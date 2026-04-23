import { verifyToken } from "../utils/auth.js";
import { ResponseError } from "../error/response-error.js";
import { NotificationTemplateService } from "../service/notification-template-service.js";
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
export class NotificationTemplateController {
    static async create(req, res, next) {
        try {
            const token = req.cookies.access_token;
            if (!token)
                throw new ResponseError(401, "Unauthorized");
            const payload = verifyToken(token);
            const response = await NotificationTemplateService.create(payload.userId, req.body);
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
            const response = await NotificationTemplateService.update(payload.userId, req.body);
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
            const response = await NotificationTemplateService.softDelete(payload.userId, req.body);
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
            if (req.query.eventKey) {
                filters.eventKey = String(req.query.eventKey);
            }
            if (req.query.recipientRole) {
                filters.recipientRole = String(req.query.recipientRole);
            }
            if (req.query.portalKey) {
                filters.portalKey = String(req.query.portalKey);
            }
            const isActive = parseBoolean(req.query.isActive);
            if (isActive !== undefined) {
                filters.isActive = isActive;
            }
            const response = await NotificationTemplateService.list(payload.userId, Object.keys(filters).length > 0 ? filters : undefined);
            res.status(200).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
}
//# sourceMappingURL=notification-template-controller.js.map