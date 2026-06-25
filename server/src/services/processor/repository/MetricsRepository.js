/**
 * @file MetricsRepository.js
 * @description PostgreSQL database repository implementation for API usage and latency metrics.
 * Extends BaseRepository to query, aggregate, and upsert performance metrics in SQL.
 */

import { BaseRepository } from "./BaseRepository.js";

/** Max allowable page result limits for security validation */
const MAX_LIMIT = 1000;
/** SQL query timeout limit in milliseconds */
const QUERY_TIMEOUT_MS = 30000;

/**
 * Repository class implementing metrics aggregation and queries on PostgreSQL.
 */
export class MetricsRepository extends BaseRepository{
    /**
     * @param {Object} dependencies
     * @param {Object} dependencies.logger - Logger interface.
     * @param {Object} dependencies.postgres - Postgres connection pool client.
     */
    constructor({ logger: l, postgres: pg } = {}) {
        super({ logger: l })
        this.postgres = pg;
    }

    /**
     * Upserts an endpoint metric slice in PostgreSQL.
     * Calculates running weighted latency averages and tracks least/greatest limits on conflicts.
     * 
     * @param {Object} metricsData - Metric fields to update.
     * @param {string} metricsData.clientId - ObjectId string representing the client.
     * @param {string} metricsData.serviceName - Name of the microservice.
     * @param {string} metricsData.endpoint - Triggered route endpoint path.
     * @param {string} metricsData.method - HTTP request method verb.
     * @param {number} metricsData.totalHits - Total API requests count.
     * @param {number} metricsData.errorHits - Count of requests resulting in HTTP errors (4xx/5xx).
     * @param {number} metricsData.avgLatency - Average request latency in milliseconds.
     * @param {number} metricsData.minLatency - Minimum recorded latency.
     * @param {number} metricsData.maxLatency - Maximum recorded latency.
     * @param {Date|string} metricsData.timeBucket - Standardized ISO time window bucket start.
     * @returns {Promise<void>}
     */
    async upsertEndpointMetrics(metricsData) {
        try {
            const {
                clientId,
                serviceName,
                endpoint,
                method,
                totalHits,
                errorHits,
                avgLatency,
                minLatency,
                maxLatency,
                timeBucket,
            } = metricsData;

            // Inserts a metric record. If conflict occurs on compound natural keys (client, service, endpoint, method, bucket),
            // updates the existing bucket, re-calculating running averages and checking min/max constraints.
            const query = `
            INSERT INTO endpoint_metrics (
            client_id, service_name, endpoint, method, total_hits, error_hits,
            avg_latency, min_latency, max_latency, time_bucket
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (client_id, service_name, endpoint, method, time_bucket)
            DO UPDATE SET
               total_hits = endpoint_metrics.total_hits + EXCLUDED.total_hits,
               error_hits = endpoint_metrics.error_hits + EXCLUDED.error_hits,
               avg_latency = (
                (endpoint_metrics.avg_latency * endpoint_metrics.total_hits) + (EXCLUDED.avg_latency * EXCLUDED.total_hits) / (endpoint_metrics.total_hits + EXCLUDED.total_hits) 
               ),
                 min_latency = LEAST(endpoint_metrics.min_latency, EXCLUDED.min_latency),
                 max_latency = GREATEST(endpoint_metrics.max_latency, EXCLUDED.max_latency),
                 updated_at = CURRENT_TIMESTAMP
            `

            await this._query(query, [
                clientId,
                serviceName,
                endpoint,
                method,
                totalHits,
                errorHits,
                avgLatency,
                minLatency,
                maxLatency,
                timeBucket,
            ])
        } catch (error) {
            this.logger.error('Error upserting endpoint metrics:', error);
            throw error;
        }
    };

    /**
     * Gets a list of aggregated metrics filtered by time windows or service endpoints.
     * 
     * @param {Object} [filter] - Metrics filter schema.
     * @param {string} [filter.clientId] - Client owner filter ID.
     * @param {string} [filter.serviceName] - Microservice identifier filter.
     * @param {string} [filter.endpoint] - Request path filter.
     * @param {Date|string} [filter.startTime] - ISO Start timestamp limit.
     * @param {Date|string} [filter.endTime] - ISO End timestamp limit.
     * @param {number} [filter.limit=100] - Response paging limit.
     * @param {number} [filter.offset=0] - Response paging offset.
     * @returns {Promise<Array<Object>>} Row objects representing matched performance records.
     */
    async getMetrics(filter = {}) {
        try {
            const { clientId, serviceName, endpoint, startTime, endTime, limit = 100, offset = 0 } = filter
            const safeLimit = Math.min(Math.max(1, limit), MAX_LIMIT);
            const safeOffset = Math.max(0, offset);

            let query = `
            SELECT
                service_name,
                endpoint,
                method,
                SUM(total_hits) as total_hits,
                SUM(error_hits) as error_hits,
                SUM(avg_latency * total_hits) / NULLIF(SUM(total_hits), 0) as avg_latency,
                MIN(min_latency) as min_latency,
                MAX(max_latency) as max_latency,
                time_bucket
            FROM endpoint_metrics
            `

            const params = [];
            let paramIndex = 1;


            let whereConditions = [];

            if (clientId != null) {
                whereConditions.push(`client_id = $${paramIndex}`);
                params.push(clientId);
                paramIndex++;
            }

            if (serviceName) {
                whereConditions.push(`service_name = $${paramIndex}`);
                params.push(serviceName);
                paramIndex++;
            }

            if (endpoint) {
                whereConditions.push(`endpoint = $${paramIndex}`);
                params.push(endpoint);
                paramIndex++;
            }

            if (startTime) {
                whereConditions.push(`time_bucket >= $${paramIndex}`);
                params.push(startTime);
                paramIndex++;
            }

            if (endTime) {
                whereConditions.push(`time_bucket <= $${paramIndex}`);
                params.push(endTime);
                paramIndex++;
            }

            if (whereConditions.length > 0) {
                query += ` WHERE ${whereConditions.join(' AND ')}`;
            }

            query += `
                GROUP BY service_name, endpoint, method, time_bucket
                ORDER BY time_bucket DESC
                LIMIT $${paramIndex}
                OFFSET $${paramIndex + 1}
            `;

            params.push(safeLimit, safeOffset);

            const result = await this._query(query, params);
            return result.rows;


        } catch (error) {
            this.logger.error('Error getting endpoint metrics:', error);
            throw error;
        }
    }

    /**
     * Retrieves the top endpoints ordered by total hits for a given client.
     * 
     * @param {string} clientId - Client organization owner ID.
     * @param {number} [limit=10] - Number of entries to return.
     * @param {Date|string} [startTime=null] - Optional start date bounds.
     * @returns {Promise<Array<Object>>} Row objects representing top endpoints.
     */
    async getTopEndpoints(clientId, limit = 10, startTime = null) {
        try {
            const safeLimit = Math.min(Math.max(1, limit), MAX_LIMIT);

            let query = `
        SELECT
          service_name,
          endpoint,
          method,
          SUM(total_hits) as total_hits,
          SUM(avg_latency * total_hits) / NULLIF(SUM(total_hits), 0) as avg_latency,
          SUM(error_hits) as error_hits
        FROM endpoint_metrics
      `;

            const params = [];
            let paramIndex = 1;

            // Add client filter only if clientId is provided
            if (clientId != null) {
                query += ` WHERE client_id = $${paramIndex}`;
                params.push(clientId);
                paramIndex++;
            }

            if (startTime) {
                query += clientId != null ? ` AND` : ` WHERE`;
                query += ` time_bucket >= $${paramIndex}`;
                params.push(startTime);
                paramIndex++;
            }

            query += `
        GROUP BY service_name, endpoint, method
        ORDER BY total_hits DESC
        LIMIT $${paramIndex}
      `;
            params.push(safeLimit);

            const result = await this._query(query, params);
            return result.rows;
        } catch (error) {
            this.logger.error('Error getting top endpoints:', error);
            throw error;
        }
    }

    /**
     * Aggregates sum, errors, average latencies, and counts unique routes cross-system.
     * 
     * @param {string} clientId - Target client organization ID.
     * @param {Date|string} [startTime=null] - Start date bounds.
     * @param {Date|string} [endTime=null] - End date bounds.
     * @returns {Promise<Object>} Object summary detailing calculated performance parameters.
     */
    async getOverallStats(clientId, startTime = null, endTime = null) {
        try {
            let query = `
        SELECT
          SUM(total_hits) as total_hits,
          SUM(error_hits) as error_hits,
          SUM(avg_latency * total_hits) / NULLIF(SUM(total_hits), 0) as avg_latency,
          COUNT(DISTINCT service_name) as unique_services,
          COUNT(DISTINCT endpoint) as unique_endpoints
        FROM endpoint_metrics
      `;

            const params = [];
            let paramIndex = 1;

            // Add client filter only if clientId is provided
            if (clientId != null) {
                query += ` WHERE client_id = $${paramIndex}`;
                params.push(clientId);
                paramIndex++;
            }

            if (startTime) {
                query += clientId != null ? ` AND` : ` WHERE`;
                query += ` time_bucket >= $${paramIndex}`;
                params.push(startTime);
                paramIndex++;
            }

            if (endTime) {
                query += (clientId != null || startTime) ? ` AND` : ` WHERE`;
                query += ` time_bucket <= $${paramIndex}`;
                params.push(endTime);
                paramIndex++;
            }

            const result = await this._query(query, params);
            return result.rows[0] || {};
        } catch (error) {
            this.logger.error('Error getting overall stats:', error);
            throw error;
        }
    }

    /**
     * Executes queries using PostgreSQL parameterized bindings with timed execution caps.
     * 
     * @private
     * @param {string} sql - SQL command string.
     * @param {Array<any>} [params=[]] - Query parameter bindings.
     * @param {Object} [client=this.postgres] - SQL connection pool target.
     * @returns {Promise<Object>} Resolved PG raw query response.
     * @throws {Error} If DB client connection pool is not configured.
     */
    _query(sql, params = [], client = this.postgres) {
        const target = client || this.postgres;

        if (!target || typeof target.query !== 'function') {
            const err = new Error('Postgres client not configured on MetricsRepository');
            this.logger.error('DB query error: Postgres client not configured');
            throw err;
        }

        return target.query({ text: sql, values: params, statement_timeout: QUERY_TIMEOUT_MS })
    }
}