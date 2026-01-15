import { verifyToken } from "../utils/auth.js";
import { ResponseError } from "../error/response-error.js";
import { MasterAccessRoleService } from "../service/master-access-role-service.js";
export class MasterAccessRoleController {
    static async create(req, res, next) {
        try {
            const token = req.cookies.access_token;
            if (!token)
                throw new ResponseError(401, "Unauthorized");
            const payload = verifyToken(token);
            const response = await MasterAccessRoleService.create(payload.userId, req.body);
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
            const response = await MasterAccessRoleService.update(payload.userId, req.body);
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
            const response = await MasterAccessRoleService.softDelete(payload.userId, req.body);
            res.status(200).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
    static async list(req, res, next) {
        try {
            const resourceType = typeof req.query.resourceType === "string"
                ? req.query.resourceType
                : undefined;
            const parentKey = typeof req.query.parentKey === "string"
                ? req.query.parentKey
                : undefined;
            const response = await MasterAccessRoleService.list(resourceType, parentKey);
            res.status(200).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
}
//# sourceMappingURL=master-access-role-controller.js.map