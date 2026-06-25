/**
 * @file AppError.js
 * @description Custom operational error helper extending standard JS Error.
 * Simplifies throwing formatted API errors with explicit HTTP status codes and validation detail arrays.
 */

/**
 * Custom error class for application operational exceptions.
 * @extends Error
 */
class AppError extends Error {
    /**
     * Creates an instance of AppError.
     * @param {string} message - User-facing description message.
     * @param {number} [statusCode=500] - Corresponding HTTP status code.
     * @param {any[]|null} [errors=null] - Optional detailed validation or list of error parameters.
     */
    constructor(message, statusCode = 500, errors = null) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        /**
         * Operational errors are anticipated runtime failures (e.g., validation fail, database match failure)
         * rather than programming bugs or hardware faults.
         * @type {boolean}
         */
        this.isOperational = true;
        
        // Capture trace context for easier troubleshooting
        Error.captureStackTrace(this, this.constructor)
    }
}

export default AppError;