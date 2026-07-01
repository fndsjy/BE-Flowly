import { verifyToken } from "../utils/auth.js";
import { ResponseError } from "../error/response-error.js";
import { MasterIkService } from "../service/master-ik-service.js";
export class MasterIkController {
    static async create(req, res, next) {
        try {
            const token = req.cookies.access_token;
            if (!token)
                throw new ResponseError(401, "Unauthorized");
            const payload = verifyToken(token);
            const response = await MasterIkService.create(payload.userId, req.body);
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
            const response = await MasterIkService.update(payload.userId, req.body);
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
            const response = await MasterIkService.softDelete(payload.userId, req.body);
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
            const search = req.query.search ? String(req.query.search) : undefined;
            const rawStatus = req.query.status ? String(req.query.status) : undefined;
            const status = rawStatus === "active" || rawStatus === "inactive" || rawStatus === "all"
                ? rawStatus
                : undefined;
            const page = req.query.page ? Number(req.query.page) : undefined;
            const pageSize = req.query.pageSize ? Number(req.query.pageSize) : undefined;
            const filters = {};
            if (sopId)
                filters.sopId = sopId;
            if (search)
                filters.search = search;
            if (status)
                filters.status = status;
            if (typeof page === "number" && Number.isFinite(page))
                filters.page = page;
            if (typeof pageSize === "number" && Number.isFinite(pageSize))
                filters.pageSize = pageSize;
            const response = await MasterIkService.list(payload.userId, filters);
            res.status(200).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
}
//# sourceMappingURL=master-ik-controller.js.map