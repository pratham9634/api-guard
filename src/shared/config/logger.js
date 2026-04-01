import winston from "winston";
import config from "./index.js";

const logger = winston.createLogger({
    level: config.node_env === "production" ? 'info' : 'debug',
    defaultMeta: { service: "api_guard" },
    format: winston.format.combine(
        winston.format.timestamp({format: "YYYY-MM-DD HH:mm:ss"}),
        winston.format.json(),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.printf(({ level, message, timestamp, stack }) => {
            return `${timestamp} [${level}]: ${message}${stack ? `\n${stack}` : ""}`;
        })
    ),
    transports: [
        new winston.transports.File({ filename: "logs/error.log", level: "error" }),
        new winston.transports.File({ filename: "logs/combined.log" }),
    ],
});

if (process.env.NODE_ENV !== "production") {
    logger.add(
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
                )
            }));
}

export default logger;