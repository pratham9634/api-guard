/**
 * @file validateApiKey.js
 * @description Ingestion API Key validation middleware.
 * Verifies external incoming HTTP requests by checking the `x-api-key` header against the PostgreSQL store.
 * Validates client activation status and authorization capability flags.
 */

import ResponseFormatter from '../utils/ResponseFormatter.js';
import logger from '../config/logger.js';
import clientContainer from '../../services/client/Dependencies/dependencies.js';

/**
 * Express middleware to validate external API keys.
 * Extracts key from `x-api-key` header, ensures client is active and possesses ingest authorization,
 * then embeds client/key structures onto the Express request object (`req.client`, `req.apiKey`).
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 */
const validateApiKey = async (req, res, next) => {
    try {
        const apiKey = req.headers['x-api-key'];

        if (!apiKey) {
            logger.warn('API request without API key', {
                path: req.path,
                ip: req.ip,
            });
            return res
                .status(401)
                .json(ResponseFormatter.error('API key is required', 401));
        }

        // Fetch client and API key record from database dependencies container
        const result = await clientContainer.services.clientServices.getClientByApiKey(apiKey);

        if (!result) {
            logger.warn('Invalid API key attempted', {
                path: req.path,
                ip: req.ip,
                apiKey: apiKey.substring(0, 8) + '...', // Log partial key for security to prevent credentials leakage
            });
            return res
                .status(403)
                .json(ResponseFormatter.error('Invalid API key', 403));
        }

        const { client, apiKey: apiKeyObj } = result;

        // Check if client account status is currently active
        if (!client.isActive) {
            logger.warn('Inactive client attempted API access', {
                path: req.path,
                ip: req.ip,
                clientId: client._id,
            });
            return res
                .status(403)
                .json(ResponseFormatter.error('Client account is inactive', 403));
        }

        // Usage limits removed — no monthly usage checks

        // Check API key permission permissions for ingestion authority
        if (!apiKeyObj.permissions?.canIngest) {
            logger.warn('API key without ingest permission attempted access', {
                path: req.path,
                ip: req.ip,
                apiKeyId: apiKeyObj._id,
            });
            return res
                .status(403)
                .json(ResponseFormatter.error('API key does not have ingest permissions', 403));
        }

        // No API key usage tracking required

        // Bind validated client and API key entities to Request context
        req.client = client;
        req.apiKey = apiKeyObj;

        logger.debug('API key validated successfully', {
            clientId: client._id,
            clientName: client.name,
            apiKeyId: apiKeyObj._id,
        });

        next();
    } catch (error) {
        logger.error('Error validating API key:', error);
        return res
            .status(500)
            .json(ResponseFormatter.error('Internal server error', 500));
    }
};

export default validateApiKey;