import { prismaEmployee, prismaFlowly } from "../application/database.js";
import type { Prisma } from "../generated/flowly/client.js";

const EMPLOYEE_PARTICIPANT_REFERENCE_TYPE = "EMPLOYEE";
const FINISHED_FLAG = "Y";
const RELEASED_FLAG = 1;
const DEFAULT_PASS_SCORE = 60;
const SYNC_ACTOR = "SYSTEM";

type SyncReleasedResultsOptions = {
  participantReferenceIds?: string[];
  portalKeys?: string[];
  examSessionIds?: string[];
};

const normalizeUpper = (value?: string | null) =>
  (value ?? "").trim().toUpperCase();

const normalizeNote = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
};

const normalizeScore = (value: unknown) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const normalized = String(value ?? "").replace(",", ".").trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const uniqueTexts = (values?: string[]) =>
  Array.from(
    new Set(
      (values ?? [])
        .map((value) => value.trim())
        .filter((value) => value.length > 0)
    )
  );

const isAssignmentBlockedFromSync = (status?: string | null) => {
  const normalized = normalizeUpper(status);
  return (
    normalized === "CANCELLED" ||
    normalized === "FAILED" ||
    normalized === "FAIL_FINAL"
  );
};

export class OnboardingExamResultSyncService {
  static async syncReleasedResults(options: SyncReleasedResultsOptions = {}) {
    const participantReferenceIds = uniqueTexts(options.participantReferenceIds);
    const portalKeys = uniqueTexts(options.portalKeys).map((value) =>
      value.toUpperCase()
    );
    const examSessionIds = uniqueTexts(options.examSessionIds);

    const where: Prisma.OnboardingExamAttemptWhereInput = {
      isDeleted: false,
      employeeExamSessionId:
        examSessionIds.length > 0 ? { in: examSessionIds } : { not: null },
      status: {
        in: ["IN_PROGRESS", "WAITING_ADMIN", "REMEDIAL", "PASSED"],
      },
      assignment: {
        participantReferenceType: EMPLOYEE_PARTICIPANT_REFERENCE_TYPE,
        isDeleted: false,
        ...(participantReferenceIds.length > 0
          ? { participantReferenceId: { in: participantReferenceIds } }
          : {}),
        ...(portalKeys.length > 0 ? { portalKey: { in: portalKeys } } : {}),
      },
    };

    const attempts = await prismaFlowly.onboardingExamAttempt.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      select: {
        onboardingExamAttemptId: true,
        onboardingAssignmentId: true,
        onboardingStageProgressId: true,
        employeeExamSessionId: true,
        attemptNo: true,
        status: true,
        submittedAt: true,
        endedAt: true,
        stageExam: {
          select: {
            passScore: true,
          },
        },
        stageProgress: {
          select: {
            stageOrder: true,
            status: true,
            remedialCount: true,
            passedAt: true,
            completedAt: true,
            assignment: {
              select: {
                status: true,
                currentStageOrder: true,
              },
            },
          },
        },
      },
    });

    const sessionIds = uniqueTexts(
      attempts.map((attempt) => attempt.employeeExamSessionId ?? "")
    );
    if (sessionIds.length === 0) {
      return { synced: 0 };
    }

    const releasedSessions = await prismaEmployee.em_session_exams.findMany({
      where: {
        exams_id: { in: sessionIds },
        is_selesai: FINISHED_FLAG,
        is_correct: RELEASED_FLAG,
        is_score_akhir: { not: null },
      },
      select: {
        exams_id: true,
        start_time: true,
        end_time: true,
        is_notes: true,
        is_score_akhir: true,
      },
    });

    const sessionMap = new Map(
      releasedSessions
        .filter((session) => session.exams_id)
        .map((session) => [session.exams_id ?? "", session] as const)
    );
    const latestAttemptNoByStageProgress = new Map<string, number>();
    for (const attempt of attempts) {
      const latestAttemptNo =
        latestAttemptNoByStageProgress.get(attempt.onboardingStageProgressId) ?? 0;
      if (attempt.attemptNo > latestAttemptNo) {
        latestAttemptNoByStageProgress.set(
          attempt.onboardingStageProgressId,
          attempt.attemptNo
        );
      }
    }

    let synced = 0;
    for (const attempt of attempts) {
      if (
        attempt.attemptNo <
        (latestAttemptNoByStageProgress.get(attempt.onboardingStageProgressId) ?? 0)
      ) {
        continue;
      }

      const session = attempt.employeeExamSessionId
        ? sessionMap.get(attempt.employeeExamSessionId)
        : null;
      if (!session || isAssignmentBlockedFromSync(attempt.stageProgress.assignment.status)) {
        continue;
      }

      const score = normalizeScore(session.is_score_akhir);
      if (score === null) {
        continue;
      }

      const releaseNote = normalizeNote(session.is_notes);
      const releasedAt = session.end_time ?? attempt.endedAt ?? new Date();
      const submittedAt = attempt.submittedAt ?? session.end_time ?? releasedAt;
      const passScore = Math.max(
        0,
        Number(attempt.stageExam.passScore ?? DEFAULT_PASS_SCORE)
      );
      const isPassed = score >= passScore;
      const nextStatus = isPassed ? "PASSED" : "REMEDIAL";
      const shouldIncrementRemedial =
        !isPassed && normalizeUpper(attempt.status) !== "REMEDIAL";

      await prismaFlowly.$transaction(async (tx) => {
        const nextStage = isPassed
          ? await tx.onboardingStageProgress.findFirst({
              where: {
                onboardingAssignmentId: attempt.onboardingAssignmentId,
                stageOrder: { gt: attempt.stageProgress.stageOrder },
                isActive: true,
                isDeleted: false,
              },
              orderBy: [{ stageOrder: "asc" }, { createdAt: "asc" }],
              select: {
                onboardingStageProgressId: true,
                stageOrder: true,
                status: true,
                startedAt: true,
              },
            })
          : null;

        await tx.onboardingExamAttempt.update({
          where: {
            onboardingExamAttemptId: attempt.onboardingExamAttemptId,
          },
          data: {
            score,
            submittedAt,
            endedAt: releasedAt,
            status: nextStatus,
            note: releaseNote,
            updatedAt: releasedAt,
            updatedBy: SYNC_ACTOR,
          },
        });

        await tx.onboardingStageProgress.update({
          where: {
            onboardingStageProgressId: attempt.onboardingStageProgressId,
          },
          data: {
            status: nextStatus,
            completedAt: releasedAt,
            passedAt: isPassed
              ? attempt.stageProgress.passedAt ?? releasedAt
              : attempt.stageProgress.passedAt,
            remedialCount: shouldIncrementRemedial
              ? { increment: 1 }
              : attempt.stageProgress.remedialCount,
            note: releaseNote,
            updatedAt: releasedAt,
            updatedBy: SYNC_ACTOR,
          },
        });

        if (isPassed && nextStage) {
          const nextStageStatus = normalizeUpper(nextStage.status);
          if (
            nextStageStatus === "LOCKED" ||
            nextStageStatus === "PENDING" ||
            nextStageStatus === "NOT_STARTED"
          ) {
            await tx.onboardingStageProgress.update({
              where: {
                onboardingStageProgressId: nextStage.onboardingStageProgressId,
              },
              data: {
                status: "READING",
                startedAt: nextStage.startedAt ?? releasedAt,
                updatedAt: releasedAt,
                updatedBy: SYNC_ACTOR,
              },
            });
          }

          await tx.onboardingAssignment.update({
            where: {
              onboardingAssignmentId: attempt.onboardingAssignmentId,
            },
            data: {
              status: "IN_PROGRESS",
              currentStageOrder: nextStage.stageOrder,
              completedAt: null,
              completedBy: null,
              updatedAt: releasedAt,
              updatedBy: SYNC_ACTOR,
            },
          });
        } else if (isPassed) {
          await tx.onboardingAssignment.update({
            where: {
              onboardingAssignmentId: attempt.onboardingAssignmentId,
            },
            data: {
              status: "PASSED_TO_LMS",
              currentStageOrder: attempt.stageProgress.stageOrder,
              completedAt: releasedAt,
              completedBy: SYNC_ACTOR,
              updatedAt: releasedAt,
              updatedBy: SYNC_ACTOR,
            },
          });
        } else {
          await tx.onboardingAssignment.update({
            where: {
              onboardingAssignmentId: attempt.onboardingAssignmentId,
            },
            data: {
              status: "REMEDIAL",
              currentStageOrder: attempt.stageProgress.stageOrder,
              updatedAt: releasedAt,
              updatedBy: SYNC_ACTOR,
            },
          });
        }
      });

      synced += 1;
    }

    return { synced };
  }
}
