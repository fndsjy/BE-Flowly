import type { Request, Response, NextFunction } from "express";
import { logger } from "../application/logging.js";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on("finish", () => {
    logger.info("HTTP request completed", {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      clientIp:
        (req.headers["x-forwarded-for"] as string | undefined)
          ?.split(",")[0]
          ?.trim() ||
        req.ip ||
        "unknown",
      durationMs: Date.now() - start,
    });
  });

  next();
}
