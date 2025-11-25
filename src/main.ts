import "dotenv/config";
import "cors";

console.log("TZ =", process.env.TZ);
console.log("Now =", new Date().toString());

import { web } from "./application/web.js";
import { logger } from "./application/logging.js";

const corsOptions = {
  origin: [
    'http://10.0.1.16:5173',
    'http://localhost:5173'
],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],

};

web.listen(5174, "0.0.0.0", () => {
    logger.info("🚀 Flowly Server is running on http://10.0.1.16:5174 and http://localhost:5174");
});
