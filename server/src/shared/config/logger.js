/**
 * @file logger.js
 * @description Configures the global Winston logger.
 * In production: Writes logs to files (`logs/error.log` and `logs/combined.log`) with `info` level threshold.
 * In development: Also outputs colorized log entries to the Console with `debug` level threshold.
 */

import winston from "winston";
import config from "./index.js";

const logger = winston.createLogger({
    // Set logger level based on environment
    level: config.node_env === "production" ? 'info' : 'debug',
    defaultMeta: { service: "api_guard" },
    format: winston.format.combine(
        // Format timestamp as YYYY-MM-DD HH:mm:ss
        winston.format.timestamp({format: "YYYY-MM-DD HH:mm:ss"}),
        winston.format.json(),
        // Format errors to capture error stack trace if available
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        // Custom printing format for logs
        winston.format.printf(({ level, message, timestamp, stack }) => {
            return `${timestamp} [${level}]: ${message}${stack ? `\n${stack}` : ""}`;
        })
    ),
    transports: [
        // Error logs are separated into their own file
        new winston.transports.File({ filename: "logs/error.log", level: "error" }),
        // All logs (info, warn, error, debug) are piped here
        new winston.transports.File({ filename: "logs/combined.log" }),
    ],
});

// Output console logs in all environments (essential for Docker and cloud PaaS dashboards like Render)
logger.add(
    new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    })
);

export default logger;