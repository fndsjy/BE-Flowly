import { PrismaClient as FlowlyClient } from "../generated/flowly/client.js";
import { PrismaClient as EmployeeClient } from "../generated/employee/client.js";
import { PrismaClient as OptidomClient } from "../generated/optidom/client.js";
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
export const optidomDatabaseEnabled = Boolean(process.env.OPTIDOM_DATABASE_URL?.trim());
const parsePositiveInteger = (value, fallback) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return fallback;
    }
    return Math.trunc(parsed);
};
const keepAliveIntervalMs = parsePositiveInteger(process.env.PRISMA_KEEPALIVE_INTERVAL_MS, 30 * 1000);
const keepAliveSlowThresholdMs = parsePositiveInteger(process.env.PRISMA_KEEPALIVE_SLOW_THRESHOLD_MS, 2000);
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
export const prismaOptidom = new OptidomClient({
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
            const startedAt = process.hrtime.bigint();
            await client.$queryRaw `SELECT 1`;
            const elapsedMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
            if (elapsedMs >= keepAliveSlowThresholdMs) {
                logger.warn(`[PRISMA ${label} KEEPALIVE SLOW]`, {
                    elapsedMs: Math.round(elapsedMs * 100) / 100,
                    thresholdMs: keepAliveSlowThresholdMs,
                });
            }
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
    prismaOptidom.$on("query", (e) => {
        logger.info(`[PRISMA OPTIDOM QUERY] ${e.query} | ${e.duration}ms`);
    });
}
prismaFlowly.$on("error", (e) => {
    logger.error(`[PRISMA FLOWLY ERROR]`, { message: e.message, target: e.target });
});
prismaEmployee.$on("error", (e) => {
    logger.error(`[PRISMA EMPLOYEE ERROR]`, { message: e.message, target: e.target });
});
prismaOptidom.$on("error", (e) => {
    logger.error(`[PRISMA OPTIDOM ERROR]`, { message: e.message, target: e.target });
});
if (enablePrismaInfoLog) {
    prismaFlowly.$on("info", (e) => {
        logger.info(`[PRISMA FLOWLY INFO]`, { message: e.message });
    });
    prismaEmployee.$on("info", (e) => {
        logger.info(`[PRISMA EMPLOYEE INFO]`, { message: e.message });
    });
    prismaOptidom.$on("info", (e) => {
        logger.info(`[PRISMA OPTIDOM INFO]`, { message: e.message });
    });
}
if (enablePrismaWarnLog) {
    prismaFlowly.$on("warn", (e) => {
        logger.info(`[PRISMA FLOWLY WARN]`, { message: e.message });
    });
    prismaEmployee.$on("warn", (e) => {
        logger.info(`[PRISMA EMPLOYEE WARN]`, { message: e.message });
    });
    prismaOptidom.$on("warn", (e) => {
        logger.info(`[PRISMA OPTIDOM WARN]`, { message: e.message });
    });
}
scheduleKeepAlive("FLOWLY", prismaFlowly);
scheduleKeepAlive("EMPLOYEE", prismaEmployee);
if (optidomDatabaseEnabled) {
    scheduleKeepAlive("OPTIDOM", prismaOptidom);
}
//# sourceMappingURL=database.js.map