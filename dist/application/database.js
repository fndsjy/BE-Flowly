import { PrismaClient } from "@prisma/client";
import { logger } from "./logging.js";
export const prismaClient = new PrismaClient({
    log: [
        {
            emit: "event",
            level: "query"
        },
        {
            emit: "event",
            level: "error"
        },
        {
            emit: "event",
            level: "info"
        },
        {
            emit: "event",
            level: "warn"
        },
    ],
});
prismaClient.$on("query", (e) => {
    logger.info(`[PRISMA QUERY] ${e.query} | ${e.duration}ms`);
});
prismaClient.$on("error", (e) => {
    logger.error(`[PRISMA ERROR]`, { message: e.message, target: e.target });
});
prismaClient.$on("info", (e) => {
    logger.info(`[PRISMA INFO]`, { message: e.message });
});
prismaClient.$on("warn", (e) => {
    logger.info(`[PRISMA WARN]`, { message: e.message });
});
//# sourceMappingURL=database.js.map