

/**
 * @file CircuitBreaker.js
 * @description Implements the Circuit Breaker pattern.
 * Prevents requests to downstream services (like RabbitMQ) when they are failing, avoiding resource exhaustion.
 * Transitions through CLOSED (healthy), OPEN (failing, rejecting requests), and HALF_OPEN (probing recovery) states.
 */

/**
 * States the Circuit Breaker can occupy.
 */
export const CircuitState = Object.freeze({
    CLOSED: 'CLOSED', // Healthy state; all requests are allowed.
    OPEN: 'OPEN',     // Error state; requests are blocked/short-circuited.
    HALF_OPEN: 'HALF_OPEN' // Trial state; limited requests are allowed to test recovery.
})

/**
 * CircuitBreaker class to track failure counts and block execution if thresholds are breached.
 */
export class CircuitBreaker{

    /**
     * @param {Object} [opts={}] - Configuration options.
     * @param {number} [opts.failureThreshold=5] - Number of failures allowed before opening the circuit.
     * @param {number} [opts.cooldownMs=30000] - Duration in milliseconds to wait in OPEN state before trying recovery.
     * @param {number} [opts.halfOpenMaxAttempts=3] - Number of successful probes required in HALF_OPEN to close the circuit.
     * @param {Object} [opts.logger=console] - Logger instance.
     */
    constructor(opts={}){
        this.failureThreshold = opts.failureThreshold ?? 5;
        this.cooldownMs = opts.cooldownMs ?? 30_000;
        this.halfOpenMaxAttempts = opts.halfOpenMaxAttempts ?? 3;
        this.logger = opts.logger ?? console;

        this._state = CircuitState.CLOSED;
        this._failures = 0;
        this._lastFailureTime = 0;
        this._halfOpenAttempts = 0;
        this._halfOpenSuccesses = 0; 
    }

    /**
     * Checks if cooldown period has elapsed since the last failure occurred.
     * @private
     * @returns {boolean}
     */
    _cooldownElapsed(){
        return Date.now() - this._lastFailureTime >= this.cooldownMs;
    }

    /**
     * Transitions the circuit breaker to a new state and logs the change.
     * @private
     * @param {string} newState - The state value to transition into.
     */
    _transitionTo(newState){
        const prev = this._state;
        this._state = newState;

        this.logger.info(`Circuit transition: ${prev} -> ${newState}`);

        if(newState === CircuitState.HALF_OPEN){
            this._halfOpenAttempts = 0;
            this._halfOpenSuccesses = 0;
            this.logger.info(`Circuit transition: ${prev} -> HALF_OPEN`);
        }
    }

    /**
     * Opens the circuit, recording the timestamp, and triggering cooldown period.
     * @private
     */
    _openCircuit(){
        this._lastFailureTime = Date.now();
        this._transitionTo(CircuitState.OPEN);
        this.logger.error('[CircuitBreaker] OPEN', {
            failures: this._failures,
            cooldownMs: this.cooldownMs,
        });
    }

    /**
     * Resets failure counters and puts the circuit back into CLOSED (healthy) state.
     * @private
     */
    _reset(){
        this._state = CircuitState.CLOSED;
        this._failures = 0;
        this._halfOpenAttempts = 0;
        this._halfOpenSuccesses = 0;
        this.logger.info('[CircuitBreaker] RESET');
    }

    /**
     * Returns the current state, dynamically transitioning from OPEN to HALF_OPEN if cooldown has elapsed.
     * @type {string}
     */
    get state() {
        if (this._state === CircuitState.OPEN && this._cooldownElapsed()) {
            this._transitionTo(CircuitState.HALF_OPEN);
        }

        return this._state
    }

    /**
     * Checks if a request is allowed to proceed.
     * In CLOSED state, all are allowed.
     * In OPEN state, none are allowed.
     * In HALF_OPEN state, up to `halfOpenMaxAttempts` requests are allowed.
     * @returns {boolean} True if the execution request is allowed, false if blocked.
     */
    allowRequest() {
        const current = this.state;

        this.logger.debug('[CircuitBreaker] allowRequest check', {
            state: current,
            halfOpenAttempts: this._halfOpenAttempts,
            halfOpenMaxAttempts: this.halfOpenMaxAttempts,
            halfOpenSuccesses: this._halfOpenSuccesses,
            failures: this._failures
        });

        // In CLOSED state, all requests are allowed. 
        if (current === CircuitState.CLOSED) return true;

        // In OPEN state, no requests are allowed until cooldown has elapsed, then it transitions to HALF_OPEN.
        if (current === CircuitState.HALF_OPEN) {
            if (this._halfOpenAttempts < this.halfOpenMaxAttempts) {
                this._halfOpenAttempts++;
                this.logger.info(`[CircuitBreaker] allowing HALF_OPEN attempt ${this._halfOpenAttempts}/${this.halfOpenMaxAttempts}`);
                return true;
            }
            this.logger.warn(`[CircuitBreaker] HALF_OPEN attempts exhausted (${this._halfOpenAttempts}/${this.halfOpenMaxAttempts})`);
            return false;
        }

        this.logger.info(`[CircuitBreaker] rejecting request, state: ${current}`);

        // In OPEN state, reject all requests until cooldown has elapsed
        return false;
    }

    /**
     * Event callback recorded on a successful downstream invocation.
     * Resets failure counters if CLOSED, and transitions to CLOSED if HALF_OPEN completes success quota.
     */
    onSuccess(){
        this.logger.info('[CircuitBreaker] success recorded', {
            state: this._state,
            halfOpenSuccesses: this._halfOpenSuccesses,
            halfOpenMaxAttempts: this.halfOpenMaxAttempts,
            failures: this._failures
        });

        if (this._state === CircuitState.HALF_OPEN) {
            this._halfOpenSuccesses++;
            this.logger.info(`[CircuitBreaker] HALF_OPEN success ${this._halfOpenSuccesses}/${this.halfOpenMaxAttempts}`);
            if (this._halfOpenSuccesses >= this.halfOpenMaxAttempts) {
                this._reset();
                this.logger.info('[CircuitBreaker] reset to CLOSED after successful half-open probes');
            }
            return;
        }

        if(this._failures>0){
            this._failures = 0;
            this.logger.info('[CircuitBreaker] failures reset to 0');
        }
    };

    /**
     * Event callback recorded on a failed downstream invocation.
     * Increments failure counter. Trips circuit to OPEN if threshold is crossed.
     */
    onFailure(){
        this.logger.error('[CircuitBreaker] failure recorded', {
            state: this._state,
            failures: this._failures,
            failureThreshold: this.failureThreshold
        });

        if(this._state === CircuitState.HALF_OPEN){
            this.logger.warn('[CircuitBreaker] half-open failed, reopening circuit');
            this._openCircuit();
            return;
        }

        this._failures++;
        this._lastFailureTime = Date.now();

        this.logger.info(`[CircuitBreaker] failure count: ${this._failures}/${this.failureThreshold}`);
        if (this._failures >= this.failureThreshold) {
            this._openCircuit();
        }
    };

    /**
     * Generates a structural snapshot of the circuit status.
     * @returns {Object}
     */
    snapshot() {
        return {
            state: this.state,
            failures: this._failures,
            lastFailureTime: this._lastFailureTime,
            halfOpenAttempts: this._halfOpenAttempts,
            halfOpenSuccesses: this._halfOpenSuccesses,
            cooldownMs: this.cooldownMs,
            failureThreshold: this.failureThreshold,
        };
    };
    
}