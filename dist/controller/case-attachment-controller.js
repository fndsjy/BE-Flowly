import { verifyToken } from "../utils/auth.js";
import { ResponseError } from "../error/response-error.js";
import { CaseAttachmentService } from "../service/case-attachment-service.js";
export class CaseAttachmentController {
    static async create(req, res, next) {
        try {
            const token = req.cookies.access_token;
            if (!token)
                throw new ResponseError(401, "Unauthorized");
            const payload = verifyToken(token);
            const response = await CaseAttachmentService.create(payload.userId, req.body);
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
            const response = await CaseAttachmentService.update(payload.userId, req.body);
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
            const response = await CaseAttachmentService.softDelete(payload.userId, req.body);
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
            };
            const response = await CaseAttachmentService.list(payload.userId, Object.keys(filters).length > 0 ? filters : undefined);
            res.status(200).json({ response });
        }
        catch (err) {
            next(err);
        }
    }
    static async download(req, res, next) {
        try {
            const token = req.cookies.access_token;
            if (!token)
                throw new ResponseError(401, "Unauthorized");
            const payload = verifyToken(token);
            const caseAttachmentId = req.params.caseAttachmentId
                ? String(req.params.caseAttachmentId)
                : "";
            if (!caseAttachmentId) {
                throw new ResponseError(400, "caseAttachmentId is required");
            }
            const file = await CaseAttachmentService.getFile(payload.userId, caseAttachmentId);
            res.setHeader("Content-Type", file.fileMime);
            res.setHeader("Content-Disposition", `inline; filename="${file.fileName}"`);
            res.sendFile(file.fullPath);
        }
        catch (err) {
            next(err);
        }
    }
}
//# sourceMappingURL=case-attachment-controller.js.map