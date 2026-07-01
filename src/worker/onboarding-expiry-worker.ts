import { logger } from "../application/logging.js";
import { OnboardingExamRuntimeService } from "../service/onboarding-exam-runtime-service.js";
import { OnboardingService } from "../service/onboarding-service.js";

const DEFAULT_INTERVAL_MS = 60 * 1000;

const getIntervalMs = () => {
  const value = Number(
    process.env.ONBOARDING_EXPIRY_WORKER_INTERVAL_MS ?? DEFAULT_INTERVAL_MS
  );

  return Number.isFinite(value) && value > 0 ? value : DEFAULT_INTERVAL_MS;
};

let isRunning = false;

const runExpiryTick = async (target: string) => {
  if (isRunning) return;
  isRunning = true;

  try {
    const [assignmentResult, examResult] = await Promise.allSettled([
      OnboardingService.expireOverdueAssignments(),
      OnboardingExamRuntimeService.finalizeExpiredRuntimeExamSessions(),
    ]);

    if (assignmentResult.status === "fulfilled" && assignmentResult.value.expired > 0) {
      logger.info("Onboarding expiry worker marked overdue assignments failed", {
        target,
        expired: assignmentResult.value.expired,
      });
    }

    if (assignmentResult.status === "rejected") {
      logger.warn("Onboarding expiry worker failed to expire assignments", {
        target,
        error:
          assignmentResult.reason instanceof Error
            ? assignmentResult.reason.message
            : String(assignmentResult.reason),
      });
    }

    if (
      examResult.status === "fulfilled" &&
      (examResult.value.finalized > 0 || examResult.value.failed > 0)
    ) {
      logger.info("Onboarding expiry worker finalized expired exam sessions", {
        target,
        scanned: examResult.value.scanned,
        finalized: examResult.value.finalized,
        failed: examResult.value.failed,
      });
    }

    if (examResult.status === "rejected") {
      logger.warn("Onboarding expiry worker failed to finalize expired exams", {
        target,
        error:
          examResult.reason instanceof Error
            ? examResult.reason.message
            : String(examResult.reason),
      });
    }
  } catch (error) {
    logger.warn("Onboarding expiry worker failed", {
      target,
      error: error instanceof Error ? error.message : String(error),
    });
  } finally {
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
