import { ResponseError } from "../error/response-error.js";
import { verifyToken } from "../utils/auth.js";
import { ChartService } from "../service/chart-service.js";
export class ChartController {
    static async create(req, res, next) {
        try {
            const token = req.cookies.access_token;
            if (!token)
                throw new ResponseError(401, "Unauthorized");
            const payload = verifyToken(token);
            const response = await ChartService.create(payload.userId, req.body);
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
            const response = await ChartService.update(payload.userId, req.body);
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
            const response = await ChartService.softDelete(payload.userId, req.body);
            res.status(200).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
    static async list(req, res, next) {
        try {
            // semua boleh, tidak butuh check role
            const response = await ChartService.listTree();
            res.status(200).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
    static async listBySbuSub(req, res, next) {
        try {
            const token = req.cookies.access_token;
            if (!token)
                throw new ResponseError(401, "Unauthorized");
            const payload = verifyToken(token);
            const { pilarId, sbuId, sbuSubId } = req.query;
            if (!sbuSubId) {
                return res.status(400).json({ error: "sbuSubId is required" });
            }
            const result = await ChartService.listBySbuSub(payload.userId, pilarId ? Number(pilarId) : undefined, sbuId ? Number(sbuId) : undefined, Number(sbuSubId));
            res.status(200).json({ response: result });
        }
        catch (err) {
            next(err);
        }
    }
}
//# sourceMappingURL=chart-controller.js.map