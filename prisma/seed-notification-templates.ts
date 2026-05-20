import { prismaFlowly } from "../src/application/database.js";
import { seedNotificationTemplates } from "./notification-template-defaults.js";

async function main() {
  console.log("Starting notification template add-only seed...");

  const result = await seedNotificationTemplates(prismaFlowly);

  console.log(
    `Notification template seed completed: ${result.createdTemplates} templates created, ${result.createdPortalMappings} portal mappings created, ${result.existingTemplates} existing templates left untouched.`
  );
}

main()
  .catch((error) => {
    console.error("Notification template seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prismaFlowly.$disconnect();
  });
