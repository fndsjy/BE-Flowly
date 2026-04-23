import { logger } from "../application/logging.js";
import { processNotificationOutbox } from "../service/case-notification-dispatcher.js";
import { processGenericNotificationOutbox } from "../service/generic-notification-dispatcher.js";
const DEFAULT_INTERVAL_MS = 10000;
const getIntervalMs = () => {
    const value = Number(process.env.WHAPI_POLL_INTERVAL_MS ?? DEFAULT_INTERVAL_MS);
    return Number.isFinite(value) && value > 0 ? value : DEFAULT_INTERVAL_MS;
};
export const startNotificationOutboxWorker = () => {
    const intervalMs = getIntervalMs();
    logger.info(`Notification outbox worker started (interval ${intervalMs}ms).`);
    const tick = async () => {
        const results = await Promise.allSettled([
            processNotificationOutbox(),
            processGenericNotificationOutbox(),
        ]);
        results.forEach((result, index) => {
            if (result.status === "fulfilled") {
                return;
            }
            logger.warn("Notification outbox tick failed", {
                target: index === 0 ? "CASE" : "GENERIC",
                error: result.reason,
            });
        });
    };
    tick().catch((error) => {
        logger.warn("Notification outbox tick failed", { target: "BOOT", error });
    });
    setInterval(() => {
        tick().catch((error) => {
            logger.warn("Notification outbox tick failed", {
                target: "INTERVAL",
                error,
            });
        });
    }, intervalMs);
};
//# sourceMappingURL=notification-outbox-worker.js.map