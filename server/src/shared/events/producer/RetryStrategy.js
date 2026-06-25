

/**
 * @file RetryStrategy.js
 * @description Provides an exponential backoff retry strategy with jitter.
 * Helps prevent the thundering herd problem by spacing retries dynamically.
 * Identifies transient network and queue connection errors that are safe to retry.
 */

/**
 * Text sub-strings found in known transient exceptions.
 */
const RETRYABLE_PATTERNS = [
    'channel closed',
    'connection closed',
    'ECONNRESET',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'buffer full',
    'heartbeat timeout',
    'not available',
    'server connection closed',
];

/**
 * Tests an error to check if it represents a retryable connection/system failure.
 * @param {Error} err - Error object.
 * @returns {boolean} True if transient/retryable.
 */
export function isRetryable(err) {
    if (!err) {
        return false;
    }

    const msg = (err.message || '').toLowerCase()
    const code = (err.code || '').toUpperCase();

    // Host lookup issues are transient and retryable
    if (code === 'ENOTFOUND') return true;

    return RETRYABLE_PATTERNS.some(
        (p) => msg.includes(p.toLowerCase()) || code.includes(p.toUpperCase())
    )
}

/**
 * RetryStrategy class that implements exponential backoff calculation.
 */
export class RetryStrategy{
    /**
     * @param {Object} [opts={}] - Configuration options.
     * @param {number} [opts.maxRetries=3] - Maximum retry attempts allowed.
     * @param {number} [opts.baseDelayMs=200] - Base delay in milliseconds.
     * @param {number} [opts.maxDelayMs=5000] - Maximum delay ceiling.
     * @param {number} [opts.jitterFactor=0.3] - Jitter factor percentage to randomize backoff time.
     */
    constructor(opts={}){
        this.maxRetries = opts.maxRetries ?? 3;
        this.baseDelayMs = opts.baseDelayMs ?? 200;
        this.maxDelayMs = opts.maxDelayMs ?? 5000;
        this.jitterFactor = opts.jitterFactor ?? 0.3;
    }

    /**
     * Checks if another attempt can be initiated.
     * @param {number} attempt - Current attempt count.
     * @returns {boolean}
     */
    shouldRetry(attempt){
        return attempt < this.maxRetries ;
    }

    /**
     * Computes the randomized delay for the current attempt index.
     * Calculated as: baseDelay * 2^attempt, capped at maxDelayMs, then jitter is added.
     * @param {number} attempt - Current attempt count.
     * @returns {number} Delay in milliseconds.
     */
    delay(attempt) {
        const exponential = this.baseDelayMs * Math.pow(2, attempt);
        const capped = Math.min(exponential, this.maxDelayMs);

        const jitterRange = capped * this.jitterFactor;
        const jitter = (Math.random() - 0.5) * 2 * jitterRange;

        return Math.max(0, Math.round(capped + jitter));
    }

    /**
     * Resolves a promise after waiting for the calculated backoff period.
     * @param {number} attempt - Current attempt count.
     * @returns {Promise<void>}
     */
    wait(attempt){
        const ms = this.delay(attempt);
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}