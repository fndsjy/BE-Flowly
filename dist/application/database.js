import { PrismaClient } from "@prisma/client";
import { PrismaClient as FlowlyClient } from "../generated/flowly/client.js";
import { PrismaClient as EmployeeClient } from "../generated/employee/client.js";
import { logger } from "./logging.js";
export const prismaFlowly = new FlowlyClient({
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
export const prismaEmployee = new EmployeeClient({
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
prismaFlowly.$on("query", (e) => {
    logger.info(`[PRISMA QUERY] ${e.query} | ${e.duration}ms`);
});
prismaFlowly.$on("error", (e) => {
    logger.error(`[PRISMA ERROR]`, { message: e.message, target: e.target });
});
prismaFlowly.$on("info", (e) => {
    logger.info(`[PRISMA INFO]`, { message: e.message });
});
prismaFlowly.$on("warn", (e) => {
    logger.info(`[PRISMA WARN]`, { message: e.message });
});
prismaEmployee.$on("query", (e) => {
    logger.info(`[PRISMA QUERY] ${e.query} | ${e.duration}ms`);
});
prismaEmployee.$on("error", (e) => {
    logger.error(`[PRISMA ERROR]`, { message: e.message, target: e.target });
});
prismaEmployee.$on("info", (e) => {
    logger.info(`[PRISMA INFO]`, { message: e.message });
});
prismaEmployee.$on("warn", (e) => {
    logger.info(`[PRISMA WARN]`, { message: e.message });
});
//# sourceMappingURL=database.js.map