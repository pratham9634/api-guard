/**
 * @file server.js
 * @description Main entry point for the API Guard Server. Initializes express, sets up
 * global middlewares, connects to all storage/messaging databases (MongoDB, PostgreSQL, RabbitMQ),
 * registers API routers, and handles graceful shutdown and process-level errors.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import config from './shared/config/index.js';
import logger from './shared/config/logger.js';
import mongodb from './shared/config/mongodb.js';
import postgres from './shared/config/postgres.js';
import rabbitmq from './shared/config/rabbitmq.js';
import errorHandler from './shared/middlewares/errorHandler.js';
import ResponseFormatter from './shared/utils/ResponseFormatter.js';
import cookieParser from "cookie-parser"

// Routers
import authRouter from "./services/auth/routes/authRouter.js"
import clientRouter from './services/client/routes/clientRoutes.js';
import ingestRouter from './services/ingest/routes/ingestRoutes.js';
import analyticsRouter from "./services/analytics/routes/analyticsRoutes.js"
import publicRouter from './services/public/routes/publicRoutes.js';

/**
 * Initialize Express app instance
 */
const app = express();

/**
 * Global HTTP Middlewares:
 * - helmet: Secures express app by setting various HTTP headers.
 * - cors: Enables cross-origin resource sharing, configured for frontend URL and credentials.
 * - cookieParser: Parses Cookie header and populates req.cookies.
 * - express.json: Parses incoming requests with JSON payloads.
 * - express.urlencoded: Parses incoming requests with urlencoded payloads.
 */
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Request logging middleware
 * Logs the HTTP method, path, IP address, and user agent for each incoming request.
 */
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.headers['user-agent']
    });
    next()
})

/**
 * Health check endpoint
 * Used by monitoring tools/orchestrators to ensure server instance is responsive.
 */
app.get('/health', (req, res) => {
    res.status(200).json(
        ResponseFormatter.success(
            {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
            },
            'Service is healthy'
        )
    );
});

/**
 * Root endpoint
 * Provides basic information about the API service and available endpoints.
 */
app.get("/", (req, res) => {
    res.status(200).json(
        ResponseFormatter.success(
            {
                service: 'API Hit Monitoring System',
                version: '1.0.0',
                endpoints: {
                    health: '/health',
                    auth: '/api/auth',
                    ingest: '/api/hit',
                    analytics: '/api/analytics',
                },
            },
            'API Hit Monitoring Service'
        )
    )
});

/**
 * Register API Routes:
 * - /api/auth: Handles user authentication (signup, login, logout, etc.)
 * - /api/hit: Handles request data ingestion
 * - /api/public: Public endpoints exposed to external consumers
 * - /api/analytics: Analytical dashboards and aggregations
 * - /api: Client and API Key management routes
 */
app.use("/api/auth", authRouter)
app.use("/api/hit", ingestRouter)
app.use("/api/public", publicRouter)
app.use("/api/analytics", analyticsRouter)
app.use("/api", clientRouter)

/**
 * 404 Handler
 * Catches all requests to unregistered endpoints.
 */
app.use((req, res) => {
    res.status(404).json(ResponseFormatter.error("Endpoint not found", 404))
})

// Global Centralized Error Handling Middleware
app.use(errorHandler)

/**
 * Initializes connections to all required data stores and message queues:
 * 1. MongoDB (for general document storage / access logs)
 * 2. PostgreSQL (for structured client, key, and user data)
 * 3. RabbitMQ (for message ingestion queues)
 * @throws {Error} If any connection fails.
 */
async function initializeConnection() {
    try {
        logger.info("Initializing database connections...");

        // Connect to MongoDB;
        await mongodb.connect();

        // Connect to PG;
        await postgres.testConnection();

        // Connect to RabbitMQ;
        await rabbitmq.connect();

        logger.info("All connections established successfully");
    } catch (error) {
        logger.error("Failed to initialize connections:", error);
        throw error;
    }
}

/**
 * Starts the express server listener after verifying connections.
 * Binds graceful shutdown handlers to standard termination signals.
 */
async function startServer() {
    try {
        await initializeConnection();

        const server = app.listen(config.port, () => {
            logger.info(`Server started on port ${config.port}`);
            logger.info(`Environment: ${config.node_env}`);
            logger.info(`API available at: http://localhost:${config.port}`);
        });

        /**
         * Closes open connections and exits the process gracefully.
         * @param {string} signal - The signal that triggered the shutdown.
         */
        const gracefulShutdown = async (signal) => {
            logger.info(`${signal} received, shutting down gracefully...`);

            server.close(async () => {
                logger.info("HTTP server closed");

                try {
                    await mongodb.disconnect();
                    await postgres.close();
                    await rabbitmq.close();
                    logger.info('All connections closed, exiting process');
                    process.exit(0);
                } catch (error) {
                    logger.error('Error during shutdown:', error);
                    process.exit(1);
                }
            })

            // Force termination after 10s timeout if connections hang
            setTimeout(() => {
                logger.error("Forced shutdown")
                process.exit(1);
            }, 10000);

        }

        // Process event listeners for termination and unhandled failures
        process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
        process.on("SIGINT", () => gracefulShutdown("SIGINT"));

        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            logger.error('Uncaught Exception:', error);
            gracefulShutdown('uncaughtException');
        });

        process.on('unhandledRejection', (reason, promise) => {
            logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
            gracefulShutdown('unhandledRejection');
        });

    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer()