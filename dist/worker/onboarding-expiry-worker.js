import { logger } from "../application/logging.js";
import { OnboardingService } from "../service/onboarding-service.js";
const DEFAULT_INTERVAL_MS = 5 * 60 * 1000;
const getIntervalMs = () => {
    const value = Number(process.env.ONBOARDING_EXPIRY_WORKER_INTERVAL_MS ?? DEFAULT_INTERVAL_MS);
    return Number.isFinite(value) && value > 0 ? value : DEFAULT_INTERVAL_MS;
};
let isRunning = false;
const runExpiryTick = async (target) => {
    if (isRunning)
        return;
    isRunning = true;
    try {
        const result = await OnboardingService.expireOverdueAssignments();
        if (result.expired > 0) {
            logger.info("Onboarding expiry worker marked overdue assignments failed", {
                target,
                expired: result.expired,
            });
        }
    }
    catch (error) {
        logger.warn("Onboarding expiry worker failed", {
            target,
            error: error instanceof Error ? error.message : String(error),
        });
    }
    finally {
        isRunning = false;
    }
};
export const startOnboardingExpiryWorker = () => {
    const intervalMs = getIntervalMs();
    logger.info(`Onboarding expiry worker started (interval ${intervalMs}ms).`);
    setInterval(() => {
        void runExpiryTick("INTERVAL");
    }, intervalMs);
    void runExpiryTick("BOOT");
};
//# sourceMappingURL=onboarding-expiry-worker.js.map