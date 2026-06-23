import mongoose from 'mongoose';
import logger from '../../../shared/config/logger.js';
import AppError from '../../../shared/utils/AppError.js';

export class AnalyticsService {
    constructor(metricsRepo, apiHitRepo) {
        if (!metricsRepo) throw new Error("AnalyticsService requires a metricsRepository");
        this.metricsRepository = metricsRepo;
        this.apiHitRepository = apiHitRepo;
    }

    async getOverallStats(clientId, filters = {}) {
        try {
            const { startTime, endTime } = this.parseTimeFilters(filters);

            const stats = await this.metricsRepository.getOverallStats(
                clientId,
                startTime,
                endTime
            )

            const totalHits = parseInt(stats.total_hits) || 0;
            const errorHits = parseInt(stats.error_hits) || 0;
            const errorRate = totalHits > 0 ? (errorHits / totalHits) * 100 : 0

            return {
                totalHits,
                errorHits,
                successHits: totalHits - errorHits,
                errorRate: parseFloat(errorRate.toFixed(2)),
                avgLatency: parseFloat(stats.avg_latency) || 0,
                uniqueServices: parseInt(stats.unique_services) || 0,
                uniqueEndpoints: parseInt(stats.unique_endpoints) || 0,
                timeRange: {
                    start: startTime,
                    end: endTime,
                },
            }
        } catch (error) {
            logger.error('Error getting overall stats:', error)
            throw error
        }
    }

    parseTimeFilters(filters = {}) {
        let { startTime, endTime } = filters;

        if (!startTime) {
            startTime = new Date();
            startTime.setHours(startTime.getHours() - 24) // Last 24 hrs
        }
        else {
            startTime = new Date(startTime);
        }


        if (!endTime) {
            endTime = new Date();
        }
        else {
            endTime = new Date(endTime);
        }

        return { startTime, endTime }

    }

    async getTopEndpoints(clientId, options = {}) {
        try {
            const { limit = 10, startTime } = options;
            const parsedStartTime = startTime ? new Date(startTime) : null;

            const endpoints = await this.metricsRepository.getTopEndpoints(clientId, limit, parsedStartTime)

            return endpoints.map((endpoint) => ({
                serviceName: endpoint.service_name,
                endpoint: endpoint.endpoint,
                method: endpoint.method,
                totalHits: parseInt(endpoint.total_hits),
                avgLatency: parseFloat(endpoint.avg_latency).toFixed(2),
                errorHits: parseInt(endpoint.error_hits),
                errorRate: parseFloat(
                    (parseInt(endpoint.error_hits) / parseInt(endpoint.total_hits)) * 100
                ).toFixed(2),
            }))
        } catch (error) {
            logger.error('Error getting top endpoints:', error);
            throw error;
        }
    }

    async getTimeSeries(clientId, filters = {}) {
        try {
            const { serviceName, endpoint, startTime, endTime, limit = 100 } = filters;

            const { endTime: end_time, startTime: start_time } = this.parseTimeFilters({ startTime, endTime });

            const metrics = await this.metricsRepository.getMetrics({ clientId, serviceName, endpoint, startTime: start_time, endTime: end_time, limit })

            return metrics.map((metric) => ({
                serviceName: metric.service_name,
                endpoint: metric.endpoint,
                method: metric.method,
                totalHits: parseInt(metric.total_hits),
                errorHits: parseInt(metric.error_hits),
                avgLatency: parseFloat(metric.avg_latency).toFixed(2),
                minLatency: parseFloat(metric.min_latency).toFixed(2),
                maxLatency: parseFloat(metric.max_latency).toFixed(2),
                timeBucket: metric.time_bucket,
            }))
        } catch (error) {
            logger.error('Error getting time series:', error);
            throw error;
        }
    }

    async getAdvancedReports(clientId, filters = {}) {
        try {
            const { startTime, endTime } = this.parseTimeFilters(filters);
            
            // Check if there is a client filter. For super_admin, clientId might be null/undefined to get overall stats.
            const queryMatch = {};
            if (clientId) {
                queryMatch.clientId = new mongoose.Types.ObjectId(clientId);
            }
            queryMatch.timestamp = { $gte: startTime, $lte: endTime };

            // 1. Status Code Distribution aggregation
            const statusCodes = await this.apiHitRepository.model.aggregate([
                { $match: queryMatch },
                { $group: { _id: "$statusCode", count: { $sum: 1 } } },
                { $sort: { _id: 1 } }
            ]);

            let statusDistribution = {
                success: 0,
                redirect: 0,
                clientError: 0,
                serverError: 0,
                details: []
            };

            statusCodes.forEach(item => {
                const code = item._id;
                const count = item.count;
                if (code >= 200 && code < 300) statusDistribution.success += count;
                else if (code >= 300 && code < 400) statusDistribution.redirect += count;
                else if (code >= 400 && code < 500) statusDistribution.clientError += count;
                else if (code >= 500 && code < 600) statusDistribution.serverError += count;
                
                statusDistribution.details.push({ statusCode: code, count });
            });

            // 2. API Key Performance aggregation
            const apiKeyPerformance = await this.apiHitRepository.model.aggregate([
                { $match: queryMatch },
                { $group: {
                    _id: "$apiKeyId",
                    totalHits: { $sum: 1 },
                    errorHits: { $sum: { $cond: [{ $gte: ["$statusCode", 400] }, 1, 0] } },
                    avgLatency: { $avg: "$latencyMs" }
                } },
                {
                    $lookup: {
                        from: "api_keys",
                        localField: "_id",
                        foreignField: "_id",
                        as: "keyInfo"
                    }
                },
                { $unwind: { path: "$keyInfo", preserveNullAndEmptyArrays: true } },
                { $project: {
                    apiKeyId: "$_id",
                    name: { $ifNull: ["$keyInfo.name", "Deleted/Unknown Key"] },
                    environment: { $ifNull: ["$keyInfo.environment", "unknown"] },
                    totalHits: 1,
                    errorHits: 1,
                    avgLatency: { $round: ["$avgLatency", 2] }
                } },
                { $sort: { totalHits: -1 } }
            ]);

            // 3. Traffic Profiling (User-Agents and IPs)
            const userAgents = await this.apiHitRepository.model.aggregate([
                { $match: queryMatch },
                { $group: { _id: "$userAgent", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]).then(res => res.map(item => ({ userAgent: item._id || 'unknown', count: item.count })));

            const ips = await this.apiHitRepository.model.aggregate([
                { $match: queryMatch },
                { $group: { _id: "$ip", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]).then(res => res.map(item => ({ ip: item._id || 'unknown', count: item.count })));

            // 4. Latency Percentiles (p50, p95, p99) over time
            const durationMs = endTime - startTime;
            let bucketFormat = "%Y-%m-%dT%H:00:00.000Z";
            if (durationMs > 2 * 24 * 60 * 60 * 1000) {
                bucketFormat = "%Y-%m-%d";
            }

            const timeSeriesResult = await this.apiHitRepository.model.aggregate([
                { $match: queryMatch },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: bucketFormat,
                                date: "$timestamp"
                            }
                        },
                        latencies: { $push: "$latencyMs" }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            const latencyPercentilesTimeSeries = timeSeriesResult.map(bucket => {
                const sorted = bucket.latencies.sort((a, b) => a - b);
                const getP = (p) => {
                    if (sorted.length === 0) return 0;
                    const idx = Math.ceil((p / 100) * sorted.length) - 1;
                    return parseFloat(sorted[idx].toFixed(2));
                };
                return {
                    timeBucket: bucket._id,
                    p50: getP(50),
                    p95: getP(95),
                    p99: getP(99),
                    count: sorted.length
                };
            });

            return {
                statusDistribution,
                apiKeyPerformance,
                userAgents,
                ips,
                latencyPercentilesTimeSeries
            };
        } catch (error) {
            logger.error('Error getting advanced reports:', error);
            throw error;
        }
    }
}