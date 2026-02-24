import "dotenv/config";
// import "cors";
console.log("TZ =", process.env.TZ);
console.log("Now =", new Date().toString());
import { web } from "./application/web.js";
import { logger } from "./application/logging.js";
import { startNotificationOutboxWorker } from "./worker/notification-outbox-worker.js";
import { prismaEmployee, prismaFlowly } from "./application/database.js";
// const corsOptions = {
//   origin: [
//     'http://10.0.1.16:5173',
//     'http://localhost:5173',
//     'http://10.0.1.100/',
// ],
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true, // penting untuk cookie/JWT
// };
const connectWithRetry = async (name, connect, attempts = 5, delayMs = 1500) => {
    for (let i = 1; i <= attempts; i += 1) {
        try {
            await connect();
            logger.info(`[PRISMA] ${name} connected`);
            return;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            logger.warn(`[PRISMA] ${name} connect attempt ${i} failed`, { message });
            if (i < attempts) {
                await new Promise((resolve) => setTimeout(resolve, delayMs));
            }
        }
    }
    throw new Error(`[PRISMA] ${name} failed to connect after ${attempts} attempts`);
};
const bootstrap = async () => {
    await connectWithRetry("flowly", () => prismaFlowly.$connect());
    await connectWithRetry("employee", () => prismaEmployee.$connect());
    web.listen(5174, "0.0.0.0", () => {
        logger.info("🚀 Flowly Server is running on http://10.0.1.16:5174 and http://localhost:5174");
    });
    const disableOutboxWorker = String(process.env.DISABLE_OUTBOX_WORKER ?? "").toLowerCase() === "true";
    if (disableOutboxWorker) {
        logger.info("Notification outbox worker disabled via DISABLE_OUTBOX_WORKER.");
    }
    else {
        startNotificationOutboxWorker();
    }
};
bootstrap().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    logger.error("Failed to bootstrap server", { message });
    process.exit(1);
});
//# sourceMappingURL=main.js.map