import winston from "winston";
export const logger = winston.createLogger({
    level: "debug",
    format: winston.format.json(),
    transports: [
        new winston.transports.Console({})
    ],
});
//# sourceMappingURL=logging.js.map