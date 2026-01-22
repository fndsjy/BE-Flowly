import { verifyToken } from "../utils/auth.js";
import { ResponseError } from "../error/response-error.js";
import { ProcedureSopService } from "../service/procedure-sop-service.js";
export class ProcedureSopController {
    static async create(req, res, next) {
        try {
            const token = req.cookies.access_token;
            if (!token)
                throw new ResponseError(401, "Unauthorized");
            const payload = verifyToken(token);
            const response = await ProcedureSopService.create(payload.userId, req.body);
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
            const response = await ProcedureSopService.update(payload.userId, req.body);
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
            const response = await ProcedureSopService.softDelete(payload.userId, req.body);
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
            const sbuSubId = req.query.sbuSubId
                ? Number(req.query.sbuSubId)
                : undefined;
            const sbuId = req.query.sbuId ? Number(req.query.sbuId) : undefined;
            const pilarId = req.query.pilarId ? Number(req.query.pilarId) : undefined;
            const sopNumber = req.query.sopNumber
                ? String(req.query.sopNumber)
                : undefined;
            if (sbuSubId !== undefined && Number.isNaN(sbuSubId)) {
                throw new ResponseError(400, "Invalid sbuSubId");
            }
            if (sbuId !== undefined && Number.isNaN(sbuId)) {
                throw new ResponseError(400, "Invalid sbuId");
            }
            if (pilarId !== undefined && Number.isNaN(pilarId)) {
                throw new ResponseError(400, "Invalid pilarId");
            }
            const filters = {
                ...(sbuSubId !== undefined ? { sbuSubId } : {}),
                ...(sbuId !== undefined ? { sbuId } : {}),
                ...(pilarId !== undefined ? { pilarId } : {}),
                ...(sopNumber ? { sopNumber } : {}),
            };
            const response = await ProcedureSopService.list(payload.userId, Object.keys(filters).length > 0 ? filters : undefined);
            res.status(200).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
}
//# sourceMappingURL=procedure-sop-controller.js.map