import { logger } from "../application/logging.js";
export function requestLogger(req, res, next) {
    const start = Date.now();
    res.on("finish", () => {
        logger.info("HTTP request completed", {
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            clientIp: req.headers["x-forwarded-for"]
                ?.split(",")[0]
                ?.trim() ||
                req.ip ||
                "unknown",
            durationMs: Date.now() - start,
        });
    });
    next();
}
//# sourceMappingURL=reqlog-middleware.js.map