import { PrismaClient as FlowlyClient } from "../generated/flowly/client.js";
import { PrismaClient as EmployeeClient } from "../generated/employee/client.js";
import { logger } from "./logging.js";
const isEnabled = (value, defaultValue = false) => {
    const normalized = value?.trim().toLowerCase();
    if (!normalized)
        return defaultValue;
    return normalized === "1" || normalized === "true" || normalized === "yes";
};
const enablePrismaQueryLog = isEnabled(process.env.PRISMA_LOG_QUERY, false);
const enablePrismaInfoLog = isEnabled(process.env.PRISMA_LOG_INFO, false);
const enablePrismaWarnLog = isEnabled(process.env.PRISMA_LOG_WARN, false);
const keepAliveEnabled = isEnabled(process.env.PRISMA_KEEPALIVE_ENABLED, true);
const parsePositiveInteger = (value, fallback) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return fallback;
    }
    return Math.trunc(parsed);
};
const keepAliveIntervalMs = parsePositiveInteger(process.env.PRISMA_KEEPALIVE_INTERVAL_MS, 4 * 60 * 1000);
const prismaLogConfig = [
    ...(enablePrismaQueryLog ? [{ emit: "event", level: "query" }] : []),
    { emit: "event", level: "error" },
    ...(enablePrismaInfoLog ? [{ emit: "event", level: "info" }] : []),
    ...(enablePrismaWarnLog ? [{ emit: "event", level: "warn" }] : []),
];
export const prismaFlowly = new FlowlyClient({
    log: prismaLogConfig,
});
export const prismaEmployee = new EmployeeClient({
    log: prismaLogConfig,
});
const scheduleKeepAlive = (label, client) => {
    if (!keepAliveEnabled) {
        return;
    }
    let running = false;
    const timer = setInterval(async () => {
        if (running) {
            return;
        }
        running = true;
        try {
            await client.$queryRaw `SELECT 1`;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Unknown keepalive error";
            logger.warn(`[PRISMA ${label} KEEPALIVE FAILED]`, {
                intervalMs: keepAliveIntervalMs,
                message,
            });
        }
        finally {
            running = false;
        }
    }, keepAliveIntervalMs);
    timer.unref?.();
};
if (enablePrismaQueryLog) {
    prismaFlowly.$on("query", (e) => {
        logger.info(`[PRISMA FLOWLY QUERY] ${e.query} | ${e.duration}ms`);
    });
    prismaEmployee.$on("query", (e) => {
        logger.info(`[PRISMA EMPLOYEE QUERY] ${e.query} | ${e.duration}ms`);
    });
}
prismaFlowly.$on("error", (e) => {
    logger.error(`[PRISMA FLOWLY ERROR]`, { message: e.message, target: e.target });
});
prismaEmployee.$on("error", (e) => {
    logger.error(`[PRISMA EMPLOYEE ERROR]`, { message: e.message, target: e.target });
});
if (enablePrismaInfoLog) {
    prismaFlowly.$on("info", (e) => {
        logger.info(`[PRISMA FLOWLY INFO]`, { message: e.message });
    });
    prismaEmployee.$on("info", (e) => {
        logger.info(`[PRISMA EMPLOYEE INFO]`, { message: e.message });
    });
}
if (enablePrismaWarnLog) {
    prismaFlowly.$on("warn", (e) => {
        logger.info(`[PRISMA FLOWLY WARN]`, { message: e.message });
    });
    prismaEmployee.$on("warn", (e) => {
        logger.info(`[PRISMA EMPLOYEE WARN]`, { message: e.message });
    });
}
scheduleKeepAlive("FLOWLY", prismaFlowly);
scheduleKeepAlive("EMPLOYEE", prismaEmployee);
//# sourceMappingURL=database.js.map