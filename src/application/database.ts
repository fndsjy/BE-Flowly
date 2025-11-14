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

prismaClient.$on("query", (e: any) => {
    logger.info(`[PRISMA QUERY] ${e.query} | ${e.duration}ms`);
});

prismaClient.$on("error", (e: any) => {
    logger.error(`[PRISMA ERROR]`, { message: e.message, target: e.target });
});

prismaClient.$on("info", (e: any) => {
    logger.info(`[PRISMA INFO]`, { message: e.message });
});

prismaClient.$on("warn", (e: any) => {
    logger.info(`[PRISMA WARN]`, { message: e.message });
});