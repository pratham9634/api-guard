/**
 * @file ingestServices.js
 * @description Service layer for the Ingest microservice.
 * Handles validation of incoming raw API hit data, generates unique event IDs,
 * and publishes events to RabbitMQ via the event producer wrapper.
 */

import logger from '../../../shared/config/logger.js';
import AppError from '../../../shared/utils/AppError.js';
import { v4 as uuidv4 } from 'uuid';


/**
 * Service class responsible for raw API hit ingestion workflows.
 */
export class IngestService {
    /**
     * @param {Object} dependencies
     * @param {Object} dependencies.eventProducer - Event producer instance used to publish events to queue
     */
    constructor({ eventProducer }) {
        if (!eventProducer) throw new Error('IngestService requires eventProducer');
        this.eventProducer = eventProducer;
    };

  
    /**
     * Ingests a raw API hit event: validates payload, enriches with metadata,
     * and attempts to publish to RabbitMQ.
     * 
     * @param {Object} hitData - Raw API hit payload from middleware/request.
     * @param {string} hitData.serviceName - Name of target API service.
     * @param {string} hitData.endpoint - Called route/endpoint path.
     * @param {string} hitData.method - HTTP method.
     * @param {number|string} hitData.statusCode - HTTP response status code.
     * @param {number|string} hitData.latencyMs - Response latency in milliseconds.
     * @param {string} hitData.clientId - ObjectId string representing the client organization.
     * @param {string} [hitData.apiKeyId] - ObjectId string representing the authenticated API key.
     * @param {string} [hitData.ip] - IP address of caller.
     * @param {string} [hitData.userAgent] - User agent of caller.
     * @returns {Promise<Object>} Object describing status of ingestion ('queued' or 'rejected').
     */
    async ingestApiHit(hitData) {
        try {
            // Validate schema structure and value boundaries
            this.validateHitData(hitData);

            // Construct enriched canonical event payload
            const event = {
                eventId: uuidv4(),
                timestamp: new Date(),
                serviceName: hitData.serviceName,
                endpoint: hitData.endpoint,
                method: hitData.method.toUpperCase(),
                statusCode: parseInt(hitData.statusCode, 10),
                latencyMs: parseFloat(hitData.latencyMs),
                clientId: hitData.clientId,
                apiKeyId: hitData.apiKeyId,
                ip: hitData.ip || 'unknown',
                userAgent: hitData.userAgent || '',
            }

            // Attempt to publish to the RabbitMQ exchange via confirmation channel and circuit breaker
            const published = await this.eventProducer.publishApiHit(event);

            if (!published) {
                // Circuit breaker is open or queue connection failed
                logger.warn('API hit rejected by circuit breaker', {
                    eventId: event.eventId,
                    endpoint: event.endpoint,
                    method: event.method,
                    clientId: event.clientId,
                });

                return {
                    eventId: event.eventId,
                    status: 'rejected',
                    reason: 'service_unavailable',
                    timestamp: event.timestamp,
                };
            }

            logger.info('API hit ingested', {
                eventId: event.eventId,
                endpoint: event.endpoint,
                method: event.method,
                clientId: event.clientId,
            });

            return {
                eventId: event.eventId,
                status: 'queued',
                timestamp: event.timestamp,
            };
        } catch (error) {
            logger.error('Error ingesting API hit:', error);
            throw error;
        }
    }

   
    /**
     * Validates incoming API hit payload fields and ranges.
     * 
     * @param {Object} hitData - Payload object to validate.
     * @throws {AppError} 400 Bad Request error if any validation check fails.
     */
    validateHitData(hitData) {
        const requiredFields = [
            'serviceName',
            'endpoint',
            'method',
            'statusCode',
            'latencyMs',
            'clientId',
        ];

        // Ensure all required properties exist
        const missingFields = requiredFields.filter((field) => !hitData[field])

        if (missingFields.length > 0) {
            throw new AppError(`Missing required fields: ${missingFields.join(",")}`, 400)
        };

        // Enforce valid HTTP verb strings
        const validMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'];

        if (!validMethods.includes(hitData.method.toUpperCase())) {
            throw new AppError(`Invalid HTTP methods: ${hitData.method} `, 400)
        };

        // Enforce numeric status code boundaries
        const statusCode = parseInt(hitData.statusCode, 10);
        if (isNaN(statusCode) || statusCode < 100 || statusCode > 599) {
            throw new AppError(`Invalid Status code : ${hitData.statusCode} `, 400)
        };

        // Enforce non-negative numeric latency values
        const latency = parseFloat(hitData.latencyMs);
        if (isNaN(latency) || latency < 0) {
            throw new AppError(`Invalid latency : ${hitData.latencyMs} `, 400)
        }
    }
}