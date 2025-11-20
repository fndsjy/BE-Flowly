import { verifyToken } from "../utils/auth.js";
import { ResponseError } from "../error/response-error.js";
import { OrgStructureService } from "../service/orgstructure-service.js";
export class OrgStructureController {
    static async create(req, res, next) {
        try {
            const token = req.cookies.access_token;
            if (!token)
                throw new ResponseError(401, "Unauthorized");
            const payload = verifyToken(token);
            const response = await OrgStructureService.create(payload.userId, req.body);
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
            const response = await OrgStructureService.update(payload.userId, req.body);
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
            await OrgStructureService.softDelete(payload.userId, req.body);
            res.status(200).json({ message: "Structure deleted" });
        }
        catch (err) {
            next(err);
        }
    }
    static async list(req, res, next) {
        try {
            const response = await OrgStructureService.list();
            res.status(200).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
}
//# sourceMappingURL=orgstructure-controller.js.map