import { PrismaClient as FlowlyClient } from "../generated/flowly/client.js";
import { PrismaClient as EmployeeClient } from "../generated/employee/client.js";
import { logger } from "./logging.js";

const isEnabled = (value: string | undefined, defaultValue = false) => {
    const normalized = value?.trim().toLowerCase();
    if (!normalized) return defaultValue;
    return normalized === "1" || normalized === "true" || normalized === "yes";
};

const enablePrismaQueryLog = isEnabled(process.env.PRISMA_LOG_QUERY, false);
const enablePrismaInfoLog = isEnabled(process.env.PRISMA_LOG_INFO, false);
const enablePrismaWarnLog = isEnabled(process.env.PRISMA_LOG_WARN, false);

const prismaLogConfig = [
    ...(enablePrismaQueryLog ? [{ emit: "event" as const, level: "query" as const }] : []),
    { emit: "event" as const, level: "error" as const },
    ...(enablePrismaInfoLog ? [{ emit: "event" as const, level: "info" as const }] : []),
    ...(enablePrismaWarnLog ? [{ emit: "event" as const, level: "warn" as const }] : []),
];

export const prismaFlowly = new FlowlyClient({
    log: prismaLogConfig,
});

export const prismaEmployee = new EmployeeClient({
    log: prismaLogConfig,
});

if (enablePrismaQueryLog) {
    prismaFlowly.$on("query", (e: any) => {
        logger.info(`[PRISMA FLOWLY QUERY] ${e.query} | ${e.duration}ms`);
    });

    prismaEmployee.$on("query", (e: any) => {
        logger.info(`[PRISMA EMPLOYEE QUERY] ${e.query} | ${e.duration}ms`);
    });
}

prismaFlowly.$on("error", (e: any) => {
    logger.error(`[PRISMA FLOWLY ERROR]`, { message: e.message, target: e.target });
});

prismaEmployee.$on("error", (e: any) => {
    logger.error(`[PRISMA EMPLOYEE ERROR]`, { message: e.message, target: e.target });
});

if (enablePrismaInfoLog) {
    prismaFlowly.$on("info", (e: any) => {
        logger.info(`[PRISMA FLOWLY INFO]`, { message: e.message });
    });

    prismaEmployee.$on("info", (e: any) => {
        logger.info(`[PRISMA EMPLOYEE INFO]`, { message: e.message });
    });
}

if (enablePrismaWarnLog) {
    prismaFlowly.$on("warn", (e: any) => {
        logger.info(`[PRISMA FLOWLY WARN]`, { message: e.message });
    });

    prismaEmployee.$on("warn", (e: any) => {
        logger.info(`[PRISMA EMPLOYEE WARN]`, { message: e.message });
    });
}
