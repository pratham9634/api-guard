/**
 * @file index.js
 * @description Centralizes environment variables and configuration parameters across the application,
 * supplying defaults where values are missing. Uses dotenv to load environment files.
 */

import dotenv from "dotenv";
dotenv.config();

const config = {
    // Node environment & port configuration
    node_env: process.env.NODE_ENV,
    port: parseInt(process.env.PORT || 3000, 10),

    // MongoDB connection credentials and database name
    mongo: {
        mongo_url: process.env.MONGO_URI || process.env.MONGO_URL || "mongodb://localhost:27017/api_guard",
        mongo_db_name: process.env.MONGO_DB_NAME || "api_guard",
    },

    // JWT (JSON Web Token) configuration for user auth
    jwt: {
        jwt_secret: process.env.JWT_SECRET,
        jwt_expires_in: process.env.JWT_EXPIRES_IN,
    },

    // PostgreSQL connection pool configuration
    postgres: {
        host: process.env.PG_HOST || process.env.POSTGRES_HOST || "localhost",
        port: parseInt(process.env.PG_PORT || process.env.POSTGRES_PORT || 5432, 10),
        user: process.env.PG_USER || process.env.POSTGRES_USER || "postgres",
        password: process.env.PG_PASSWORD || process.env.POSTGRES_PASSWORD || "postgres",
        database: process.env.PG_DATABASE || process.env.POSTGRES_DB || "api_guard",
    },

    // RabbitMQ connections and settings for messaging
    rabbitmq: {
        url: process.env.RABBITMQ_URL || "amqp://localhost:5672",
        queue: process.env.RABBITMQ_QUEUE || "api_hits",
        publisherConfirm: process.env.RABBITMQ_PUBLISHER_CONFIRM === "true",  // Uses publisher confirmations if true
        retryAttempts: parseInt(process.env.RABBITMQ_RETRY_ATTEMPTS || 3, 10),
        retryDelay: parseInt(process.env.RABBITMQ_RETRY_DELAY || 1000, 10),
    },

    // General rate limiting settings (express-rate-limit equivalents)
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, 10), // 15 minutes window
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX || 100, 10), // Max requests per window duration
    },

    // Cookie configuration for web client sessions
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 24 * 60 * 60 * 1000, // Expires in 24 hours
    },

}
export default config;