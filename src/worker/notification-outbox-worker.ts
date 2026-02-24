import { logger } from "../application/logging.js";
import { processNotificationOutbox } from "../service/case-notification-dispatcher.js";

const DEFAULT_INTERVAL_MS = 10000;

const getIntervalMs = () => {
  const value = Number(process.env.WHAPI_POLL_INTERVAL_MS ?? DEFAULT_INTERVAL_MS);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_INTERVAL_MS;
};

export const startNotificationOutboxWorker = () => {
  const intervalMs = getIntervalMs();
  logger.info(`Notification outbox worker started (interval ${intervalMs}ms).`);

  const tick = () => {
    processNotificationOutbox().catch((error) => {
      logger.warn("Notification outbox tick failed", { error });
    });
  };

  tick();
  setInterval(tick, intervalMs);
};
