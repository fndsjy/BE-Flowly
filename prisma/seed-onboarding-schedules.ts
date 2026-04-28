import { prismaEmployee, prismaFlowly } from "../src/application/database.js";
import { OnboardingEmployeeScheduleSyncService } from "../src/service/onboarding-employee-schedule-sync-service.js";

async function main() {
  console.log("Starting onboarding employee schedule sync...");

  const results = await OnboardingEmployeeScheduleSyncService.syncAll();
  const totalQuestions = results.reduce((sum, result) => sum + result.questionCount, 0);

  for (const result of results) {
    console.log(
      `Schedule ${result.scheduleId}: ${result.portalKey}/${result.stageCode} -> ${result.questionCount} questions, ${result.summaryRowCount} summaries`
    );
  }

  console.log(
    `Onboarding employee schedule sync completed: ${results.length} schedules, ${totalQuestions} questions.`
  );
}

main()
  .catch((error) => {
    console.error("Onboarding employee schedule sync failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prismaFlowly.$disconnect();
    await prismaEmployee.$disconnect();
  });
