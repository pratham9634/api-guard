/**
 * @file createEventProducer.js
 * @description Factory function that instantiates the complete EventProducer client
 * configured with retry strategies, circuit breaker parameters, and confirm channel manager defaults.
 */

import config from '../../config/index.js';
import logger from '../../config/logger.js';
import rabbitmq from '../../config/rabbitmq.js';

import { CircuitBreaker } from './CircuitBreaker.js';
import { ConfirmChannelManager } from './ConfirmChannelManager.js';
import { RetryStrategy } from './RetryStrategy.js';
import { EventProducer } from './eventProducer.js';

/**
 * Creates and configures a new EventProducer instance.
 * @param {Object} [overrides={}] - Modules or settings to override default behaviors (useful in test mocks).
 * @param {Object} [overrides.logger] - Logger implementation.
 * @param {Object} [overrides.rabbitmq] - RabbitMQ connection manager.
 * @param {string} [overrides.queueName] - Target queue for publish operations.
 * @param {ConfirmChannelManager} [overrides.channelManager] - Confirm channel manager instance.
 * @param {CircuitBreaker} [overrides.circuitBreaker] - Circuit breaker configuration.
 * @param {RetryStrategy} [overrides.retryStrategy] - Exponential backoff retry helper.
 * @returns {EventProducer} Instantiated EventProducer.
 */
export function createEventProducer(overrides = {}) {
    const log = overrides.logger ?? logger;
    const rmq = overrides.rabbitmq ?? rabbitmq;
    const queueName = overrides.queueName ?? config.rabbitmq.queue;

    // Validate critical dependencies
    if (!rmq) throw new Error('RabbitMQ connection manager is required');
    if (!queueName) throw new Error('Queue name must be specified');
    if (!config.rabbitmq.retryAttempts || config.rabbitmq.retryAttempts < 0) {
        throw new Error('Invalid retry attempts configuration');
    }

    // Initialize Channel manager to lease RabbitMQ confirm channels
    const channelManager = overrides.channelManager ?? new ConfirmChannelManager({ rabbitmq: rmq, logger: log });

    // Initialize Circuit Breaker for down-stream protection
    const circuitBreaker = overrides.circuitBreaker ?? new CircuitBreaker({
        failureThreshold: 2,
        cooldownMs: 30_000,
        halfOpenMaxAttempts: 3,
        logger: log,
    });

    // Configure exponential backoff retry strategy with jitter to prevent thundering herd problems
     const retryStrategy = overrides.retryStrategy ?? new RetryStrategy({
        maxRetries: config.rabbitmq.retryAttempts,
        baseDelayMs: config.rabbitmq.retryDelay,
        maxDelayMs: 5_000,
        jitterFactor: 0.3,
    });


    return new EventProducer({ channelManager, circuitBreaker, retryStrategy, logger: log, queueName })
}