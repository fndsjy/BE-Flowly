import { ResponseError } from "../error/response-error.js";
import { NotFoundError } from "../error/notfound-error.js";
import { ApplicationService } from "../service/app-service.js";
export class ApplicationController {
    static handleGetRoot(req, res) {
        const data = ApplicationService.getRootMessage();
        res.status(200).json(data);
    }
    static handleNotFound(req, res, next) {
        const err = new NotFoundError(req.method, req.url);
        next(err); // lempar ke error middleware
    }
    static handleError(err, req, res, next) {
        // Jika ini instance ResponseError (termasuk NotFoundError), ambil status-nya
        const status = err instanceof ResponseError ? err.status : 500;
        res.status(status).json({
            error: {
                name: err.name || "InternalServerError",
                message: err.message || "Something went wrong",
                details: err.details || {},
            },
        });
    }
    // Helper pagination — tetap bisa dipakai di controller lain
    static getOffsetFromRequest(req) {
        const page = parseInt(req.query.page, 10) || 1;
        const pageSize = parseInt(req.query.pageSize, 10) || 10;
        return (page - 1) * pageSize;
    }
    static buildPaginationObject(req, count) {
        const page = parseInt(req.query.page, 10) || 1;
        const pageSize = parseInt(req.query.pageSize, 10) || 10;
        const pageCount = Math.ceil(count / pageSize);
        return {
            page,
            pageCount,
            pageSize,
            count,
        };
    }
}
//# sourceMappingURL=app-controller.js.map