/**
 * @file ingestController.js
 * @description Controller implementation for the Ingest service.
 * Handles incoming raw API ingestion HTTP requests, extracts metadata,
 * passes them to the service layer, and returns HTTP responses.
 */

import logger from "../../../shared/config/logger.js";
import ResponseFormatter from "../../../shared/utils/responseFormatter.js";

/**
 * Controller class that routes HTTP payloads into the API hit ingestion service.
 */
export class IngestController {
    /**
     * @param {Object} dependencies
     * @param {Object} dependencies.ingestService - Ingest service instance
     */
    constructor({ ingestService }) {
        if (!ingestService) throw new Error("IngestController requires ingest service");
        this.ingestService = ingestService;
    };

    /**
     * Express route handler for ingesting a single API hit event.
     * Enriches body with client and request contexts.
     * Returns 202 Accepted if queued, or 503 Service Unavailable if rejected by circuit breaker.
     * 
     * @param {import('express').Request} req - Express request object.
     * @param {import('express').Response} res - Express response object.
     * @param {import('express').NextFunction} next - Express next middleware function.
     * @returns {Promise<void>}
     */
    async ingestHit(req, res, next) {
        try {
            logger.info('Ingest: Client data received', {
                clientId: req.client._id,
                clientName: req.client.name,
                clientKeys: Object.keys(req.client)
            });

            // Populate hit details combining body parameters and validated auth credentials
            const hitData = {
                ...req.body,
                clientId: req.client._id,
                apiKeyId: req.apiKey._id,
                ip: req.ip || req.connection.remoteAddress,
                userAgent: req.headers['user-agent'] || ''
            };

            logger.info('Ingest: Hit data prepared', {
                clientId: req.client._id,
                endpoint: hitData.endpoint,
                method: hitData.method
            });

            const result = await this.ingestService.ingestApiHit(hitData);

            // Handle service overload or event producer circuit breaker open state
            if (result.status === 'rejected') {
                return res.status(503).json(ResponseFormatter.error(
                    'Service temporarily unavailable',
                    503,
                    {
                        eventId: result.eventId,
                        reason: result.reason,
                        retryAfter: '30 seconds'
                    }
                ));
            }

            // Successfully queued API hit event in messaging system for database writing
            res.status(202).json(ResponseFormatter.success(result, 'API hit queued for processing', 202))
        } catch (error) {
            next(error)
        }
    }
}