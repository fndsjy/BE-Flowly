import { web } from "./application/web.js";
import { logger } from "./application/logging.js";
web.listen(5174, () => {
    logger.info("🚀 Flowly Server is running on http://localhost:5174");
});
//# sourceMappingURL=main.js.map