import { verifyToken } from "../utils/auth.js";
import { ResponseError } from "../error/response-error.js";
import { AccessRoleService } from "../service/access-role-service.js";
export class AccessRoleController {
    static async create(req, res, next) {
        try {
            const token = req.cookies.access_token;
            if (!token)
                throw new ResponseError(401, "Unauthorized");
            const payload = verifyToken(token);
            const response = await AccessRoleService.create(payload.userId, req.body);
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
            const response = await AccessRoleService.update(payload.userId, req.body);
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
            const response = await AccessRoleService.softDelete(payload.userId, req.body);
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
            if (typeof req.query.subjectType === "string") {
                filters.subjectType = req.query.subjectType;
            }
            if (typeof req.query.subjectId === "string") {
                filters.subjectId = req.query.subjectId;
            }
            if (typeof req.query.resourceType === "string") {
                filters.resourceType = req.query.resourceType;
            }
            if (typeof req.query.resourceKey === "string") {
                filters.resourceKey = req.query.resourceKey;
            }
            if (typeof req.query.masAccessId === "string") {
                filters.masAccessId = req.query.masAccessId;
            }
            if (typeof req.query.isActive === "string") {
                filters.isActive = req.query.isActive === "true";
            }
            const response = await AccessRoleService.list(payload.userId, filters);
            res.status(200).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
    static async getSummary(req, res, next) {
        try {
            const token = req.cookies.access_token;
            if (!token)
                throw new ResponseError(401, "Unauthorized");
            const payload = verifyToken(token);
            const response = await AccessRoleService.getSummary(payload.userId);
            res.status(200).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
}
//# sourceMappingURL=access-role-controller.js.map