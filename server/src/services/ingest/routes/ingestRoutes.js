/**
 * @file ingestRoutes.js
 * @description Express routing configuration for the Ingest microservice.
 * Mounts standard endpoint routes, applying API key validation and rate-limiting rules.
 */

import express from "express";
import ingestContainer from '../Dependencies/dependencies.js';
const { ingestController } = ingestContainer;
import validateApiKey from '../../../shared/middlewares/validateApiKey.js';
import rateLimit from 'express-rate-limit';
import config from '../../../shared/config/index.js';

const router = express.Router();

/**
 * Express middleware rate limiter tailored for high-throughput ingestion.
 * Uses configuration values for window size and max allowed requests.
 */
const ingestLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: {
        success: false,
        message: 'Too many requests, please try again later',
        statusCode: 429
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false // Disable the `X-RateLimit-*` headers
})

/**
 * @route POST /api/ingest
 * @desc Ingests a new API hit log event.
 * @access Private (Requires valid client API Key header: `x-api-key`)
 */
router.post("/", validateApiKey, ingestLimiter, (req, res, next) => ingestController.ingestHit(req, res, next))

export default router;