/**
 * @file ProcessorService.js
 * @description Core service layer implementation for the Processor microservice.
 * Orchestrates event logging, dual persistence (writing raw logs to MongoDB and updating aggregated metrics in PostgreSQL),
 * and handles data retention cleaning schedules.
 */

import logger from '../../../shared/config/logger.js';

/**
 * Service class performing API hit logging and metrics computations.
 */
export class ProcessorService {
    /**
     * @param {Object} dependencies
     * @param {Object} dependencies.apiHitRepository - MongoDB raw hit repository instance.
     * @param {Object} dependencies.metricsRepository - PostgreSQL metrics repository instance.
     */
    constructor({ apiHitRepository, metricsRepository }) {
        if (!apiHitRepository || !metricsRepository) throw new Error('ProcessorService requires apiHitRepository and metricsRepository');
        this.apiHitRepository = apiHitRepository;
        this.metricsRepository = metricsRepository;
    };

    /**
     * Rounds a timestamp down to the nearest time bucket boundary (e.g. minute, hour, day).
     * 
     * @param {Date|string|number} timestamp - The source timestamp to bucket.
     * @param {string} [interval='hour'] - Bucket resolution ('minute', 'hour', 'day').
     * @returns {Date} Rounded date object.
     */
    getTimeBucket(timestamp, interval = 'hour') {
        const date = new Date(timestamp);

        switch (interval) {
            case 'hour':
                date.setMinutes(0, 0, 0);
                break;
            case 'day':
                date.setHours(0, 0, 0, 0);
                break;
            case 'minute':
                date.setSeconds(0, 0);
                break;
            default:
                date.setMinutes(0, 0, 0);
        }

        return date;
    };

    /**
     * Entry handler that processes a raw API hit event.
     * Writes raw details to MongoDB. If successful, attempts to upsert performance counters in Postgres.
     * Treats MongoDB failures as critical (re-throws to trigger RabbitMQ retry), while logging Postgres errors as non-critical alerts.
     * 
     * @param {Object} eventData - Enriched API hit object from queue.
     * @returns {Promise<void>}
     */
    async processEvent(eventData) {
        let rawEventSaved = false;

        try {
            logger.info('Processing event data:', {
                eventId: eventData.eventId,
                clientId: eventData.clientId,
                serviceName: eventData.serviceName,
                endpoint: eventData.endpoint,
                method: eventData.method,
            });

            // STEP 1: Save raw data to MongoDB.
            // This is critical; if this fails, the message will be retried in RabbitMQ.
            await this.apiHitRepository.save(eventData)
            rawEventSaved = true;

            logger.info('Raw event saved to MongoDB:', {
                eventId: eventData.eventId
            });

            // STEP 2: Upsert aggregated metrics in PostgreSQL.
            // If PostgreSQL is down, we don't fail the whole event processing to keep ingestion functional.
            await this._updateMetricsWithFallback(eventData);

            logger.info('Event processed successfully:', {
                eventId: eventData.eventId
            });
        } catch (error) {
            if (!rawEventSaved) {
                logger.error('Critical: Failed to save raw event to MongoDB:', {
                    error: error.message,
                    eventId: eventData.eventId,
                });
                throw error;
            }

            logger.error('Non-critical: Raw event saved but metrics update failed:', {
                error: error.message,
                eventId: eventData.eventId,
            });
        }
    }

    /**
     * Converts a single event record into metrics counters and updates PostgreSQL.
     * 
     * @private
     * @param {Object} eventData - Raw hit details.
     * @returns {Promise<void>}
     */
    async _updateMetricsWithFallback(eventData) {
        try {
            // Group performance logs in hourly buckets
            const timeBucket = this.getTimeBucket(eventData.timestamp, "hour")

            // Prepare record properties mapping status error categories
            const metricsData = {
                clientId: eventData.clientId.toString(),
                serviceName: eventData.serviceName,
                endpoint: eventData.endpoint,
                method: eventData.method,
                totalHits: 1,
                errorHits: eventData.statusCode >= 400 ? 1 : 0,
                avgLatency: eventData.latencyMs,
                minLatency: eventData.latencyMs,
                maxLatency: eventData.latencyMs,
                timeBucket,
            };

            await this.metricsRepository.upsertEndpointMetrics(metricsData);

            logger.info('Metrics updated successfully', {
                eventId: eventData.eventId,
            });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Purges historical MongoDB API hit documents beyond the retention window limit.
     * 
     * @param {number} [daysToKeeep=30] - Number of days of history to retain.
     * @returns {Promise<number>} Deletion counts.
     */
    async cleanupOldEvents(daysToKeeep = 30) {
        try {
            let cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeeep);

            const deletedCount = await this.apiHitRepository.deleteOldHits(cutoffDate)
            return deletedCount;
        } catch (error) {
            logger.error('Error during cleanup:', error);
            throw error;
        }
    }
}