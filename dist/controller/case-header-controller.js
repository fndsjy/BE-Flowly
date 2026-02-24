import { verifyToken } from "../utils/auth.js";
import { ResponseError } from "../error/response-error.js";
import { CaseHeaderService } from "../service/case-header-service.js";
export class CaseHeaderController {
    static async create(req, res, next) {
        try {
            const token = req.cookies.access_token;
            if (!token)
                throw new ResponseError(401, "Unauthorized");
            const payload = verifyToken(token);
            const response = await CaseHeaderService.create(payload.userId, req.body);
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
            const response = await CaseHeaderService.update(payload.userId, req.body);
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
            const response = await CaseHeaderService.softDelete(payload.userId, req.body);
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
            const filters = {
                ...(req.query.caseId ? { caseId: String(req.query.caseId) } : {}),
                ...(req.query.caseType
                    ? { caseType: String(req.query.caseType).toUpperCase() }
                    : {}),
                ...(req.query.status
                    ? { status: String(req.query.status).toUpperCase() }
                    : {}),
                ...(req.query.originSbuSubId
                    ? { originSbuSubId: Number(req.query.originSbuSubId) }
                    : {}),
                ...(req.query.requesterId
                    ? { requesterId: String(req.query.requesterId) }
                    : {}),
                ...(req.query.requesterEmployeeId
                    ? { requesterEmployeeId: Number(req.query.requesterEmployeeId) }
                    : {}),
                ...(req.query.sbuSubId ? { sbuSubId: Number(req.query.sbuSubId) } : {}),
                ...(req.query.assigneeEmployeeId
                    ? { assigneeEmployeeId: Number(req.query.assigneeEmployeeId) }
                    : {}),
                ...(req.query.decisionStatus
                    ? { decisionStatus: String(req.query.decisionStatus).toUpperCase() }
                    : {}),
            };
            const numericKeys = [
                "originSbuSubId",
                "requesterEmployeeId",
                "sbuSubId",
                "assigneeEmployeeId",
            ];
            for (const key of numericKeys) {
                const value = filters[key];
                if (value !== undefined && Number.isNaN(value)) {
                    throw new ResponseError(400, `Invalid ${key}`);
                }
            }
            const response = await CaseHeaderService.list(payload.userId, Object.keys(filters).length > 0 ? filters : undefined);
            res.status(200).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
}
//# sourceMappingURL=case-header-controller.js.map