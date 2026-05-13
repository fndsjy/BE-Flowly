import { ZodError } from "zod";
import { ResponseError } from "../error/response-error.js";
import { logger } from "../application/logging.js";
export const errorMiddleware = async (error, req, res, next) => {
    if (error instanceof ZodError) {
        logger.warn("Validation error", {
            method: req.method,
            url: req.originalUrl,
            issues: error.issues,
        });
        res.status(400).json({
            error: `Validation Error : ${JSON.stringify(error)}`,
            issues: error.issues,
        });
    }
    else if (error instanceof ResponseError) {
        logger.warn("Response error", {
            method: req.method,
            url: req.originalUrl,
            status: error.status,
            message: error.message,
        });
        res.status(error.status).json({
            errors: error.message
        });
    }
    else {
        logger.error("Unhandled error", {
            method: req.method,
            url: req.originalUrl,
            message: error.message,
            stack: error.stack,
        });
        res.status(500).json({
            error: error.message || "Internal Server Error"
        });
    }
};
//# sourceMappingURL=error-middleware.js.map