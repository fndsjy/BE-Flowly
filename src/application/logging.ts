import winston from "winston";
import fs from "fs";
import path from "path";

const LOG_DIR = path.resolve(process.env.LOG_DIR ?? path.join(process.cwd(), "logs"));

const transports: winston.transport[] = [new winston.transports.Console({})];

try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    transports.push(
        new winston.transports.File({
            filename: path.join(LOG_DIR, "app.log"),
        }),
        new winston.transports.File({
            filename: path.join(LOG_DIR, "error.log"),
            level: "error",
        })
    );
} catch (err) {
    console.warn("Failed to initialize file logging", err);
}

export const logger = winston.createLogger({
    level: "debug",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    transports,
})
