import { verifyToken } from "../utils/auth.js";
import { ResponseError } from "../error/response-error.js";
import { ProcedureSopIkService } from "../service/procedure-sop-ik-service.js";
export class ProcedureSopIkController {
    static async create(req, res, next) {
        try {
            const token = req.cookies.access_token;
            if (!token)
                throw new ResponseError(401, "Unauthorized");
            const payload = verifyToken(token);
            const response = await ProcedureSopIkService.create(payload.userId, req.body);
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
            const response = await ProcedureSopIkService.update(payload.userId, req.body);
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
            const response = await ProcedureSopIkService.softDelete(payload.userId, req.body);
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
            const sopId = req.query.sopId ? String(req.query.sopId) : undefined;
            const ikId = req.query.ikId ? String(req.query.ikId) : undefined;
            const filters = {
                ...(sopId ? { sopId } : {}),
                ...(ikId ? { ikId } : {}),
            };
            const response = await ProcedureSopIkService.list(payload.userId, Object.keys(filters).length > 0 ? filters : undefined);
            res.status(200).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
}
//# sourceMappingURL=procedure-sop-ik-controller.js.map