/**
 * @file eventProducer.js
 * @description Core EventProducer class. Handles reliability layers:
 * 1. Checks circuit breaker state before attempting publish.
 * 2. Attempts to publish to RabbitMQ confirm channel.
 * 3. Catches and retries retryable network/broker errors with jitter delay.
 * 4. Tracks publication metrics (successes, errors, retries).
 * 5. Registers to 'drain' events to log broker backpressure.
 */

import { EVENT_TYPES } from "../eventContracts.js";
import { isRetryable } from "./RetryStrategy.js"

/**
 * EventProducer coordinates RabbitMQ publication with resilience wrappers.
 */
export class EventProducer {
    /**
     * @param {Object} dependencies - Dependent modules.
     * @param {ConfirmChannelManager} dependencies.channelManager - Channel provider.
     * @param {CircuitBreaker} dependencies.circuitBreaker - Circuit breaker monitor.
     * @param {RetryStrategy} dependencies.retryStrategy - Retry coordinator.
     * @param {Object} dependencies.logger - Logger implementation.
     * @param {string} dependencies.queueName - Destination queue name.
     */
    constructor({channelManager,circuitBreaker,retryStrategy,logger,queueName}){
        if(!channelManager) throw new Error("Channel Manager is required");
        if(!circuitBreaker) throw new Error("Circuit Breaker is required");
        if(!retryStrategy) throw new Error("Retry Strategy is required");
        if(!logger) throw new Error("Logger is required");
        if(!queueName) throw new Error("Queue Name is required");

        this._channelManager = channelManager;
        this._circuitBreaker = circuitBreaker;
        this._retry = retryStrategy;
        this._logger = logger ?? console;
        this._queueName = queueName;

        this._metrics = {
            published: 0,
            failed: 0,
            retriesExhausted : 0
        }
        this._shuttingDown = false;
    }

    /**
     * Helper to safely increment local counters.
     * @private
     * @param {string} metric - Key name.
     */
    _incrementMetric(metric){
        this._metrics[metric] = (this._metrics[metric] ?? 0) + 1;
    }

    /**
     * Main entry point to publish an API hit event to the queue.
     * Wraps the operation inside a retry loop, circuit check, and grace period constraints.
     * @param {Object} eventData - API request event data payload.
     * @param {string} eventData.eventId - Unique identifier representing this hit.
     * @param {string} eventData.endpoint - Target URL route.
     * @param {Object} [opts={}] - Custom headers and options.
     * @param {string} [opts.correlationId] - ID linking related actions. Defaults to eventId.
     * @returns {Promise<boolean>} True if publication succeeded, false if short-circuited by circuit breaker.
     * @throws {Error} If publication fails after exhausting retries or faces non-retryable error.
     */
    async publishApiHit(eventData,opts={}){
        if (this._shuttingDown) {
            const error = new Error("EventProducer is shutting down");
            error.code = 'SHUTDOWN_IN_PROGRESS';
            this._logger.info('[EventProducer] publish rejected — shutting down', {
                eventId: eventData.eventId,
            });
            throw error;
        }

        // Short-circuit request if circuit breaker state is OPEN
        if (!this._circuitBreaker.allowRequest()) {
            this._logger.info('[EventProducer] circuit breaker rejected publish', {
                eventId: eventData.eventId,
                state: this._circuitBreaker.state,
            });
            return false;
        };

        const correlationId = opts.correlationId ?? eventData.eventId;
        const startMs = Date.now();
        let attempt = 0;

        // Loop until success or maximum retries are hit
        while(true){
            try{
                await this._publish(eventData,{correlationId,attempt});
                const latencyMs = Date.now() - startMs;
                this._circuitBreaker.onSuccess();
                this._incrementMetric('published');

                this._logger.info('[EventProducer] published', {
                    eventId: eventData.eventId,
                    correlationId,
                    attempt: attempt + 1,
                    latencyMs,
                    endpoint: eventData.endpoint,
                });

                return true;
            }catch (error) {
                this._logger.error('[EventProducer] publish attempt failed', {
                    eventId: eventData.eventId,
                    correlationId,
                    attempt: attempt + 1,
                    error: error.message,
                });

                // Determine if error pattern suggests broker offline/network timed out AND if retries remain
                const canRetry = isRetryable(error) && this._retry.shouldRetry(attempt);

                if (!canRetry) {
                    // Record failure against the Circuit Breaker logic
                    this._circuitBreaker.onFailure();
                    this._incrementMetric('failed');
                    if (!this._retry.shouldRetry(attempt)) {
                        this._incrementMetric('retriesExhausted');
                    }
                    throw error
                };

                // Wait for calculated delay before starting next loop iteration
                await this._retry.wait(attempt);
                attempt++
            }
        }
    }

    /**
     * Publishes direct message buffer to the channel, returns promise resolving on publisher confirmation.
     * @private
     * @param {Object} eventData - Raw hit data.
     * @param {Object} context - Publishing attempts tracking variables.
     * @returns {Promise<void>} Resolves when RabbitMQ broker confirms receipt.
     */
    async _publish(eventData,{correlationId,attempt}){
        const channel = await this._channelManager.getChannel();

        const message = {
            type: EVENT_TYPES.API_HIT,
            data: eventData,
            publishedAt: new Date().toISOString(),
            attempt: attempt + 1
        };

        const buffer = Buffer.from(JSON.stringify(message));

        const publishOptions = {
            persistent: true, // Write to disk on rabbitmq server
            contentType: 'application/json',
            messageId: eventData.eventId,
            correlationId,
            timestamp: Math.floor(Date.now() / 1000)
        };

        return new Promise((resolve, reject) => {
            const written = channel.publish(
                '',
                this._queueName,
                buffer,
                publishOptions,
                (err) => {
                    // Callback invoked by RabbitMQ confirm channel to ack/nack the message
                    if (err) return reject(new Error(`Publish nacked: ${err.message}`));
                    resolve();
                }
            );

            // Channel.publish returns false if write buffer limits are hit (back-pressure)
            if (!written) {
                this._logger.info('[EventProducer] back-pressure detected, waiting for drain', {
                    eventId: eventData.eventId,
                });
            }

            const onDrain = () => {
                channel.removeListener('drain', onDrain);
                this._logger.debug('[EventProducer] drain event received', {
                    eventId: eventData.eventId,
                });
            }

            channel.once("drain", onDrain)
        });


    }

    /**
     * Puts producer in shutdown state and closes confirm channel manager.
     */
    async shutdown() {
        this._shuttingDown = true;
        this._logger.info('[EventProducer] shutting down…');
        await this._channelManager.close();
        this._logger.info('[EventProducer] shutting completed');
    };

    /**
     * Exports stats object of publication metrics and circuit breaker snapshots.
     * @returns {Object}
     */
    getStats() {
        return {
            metrics: { ...this._metrics },
            circuitBreaker: this._circuitBreaker.snapshot()
        }
    }
}