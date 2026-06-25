
/**
 * @file ResponseFormatter.js
 * @description Standard response serializer helper.
 * Provides uniform JSON objects containing success status, timestamp, code, error messages, and payload data.
 */

class ResponseFormatter {

    /**
     * Formats positive api data response.
     * @param {any} [data=null] - Action result payloads.
     * @param {string} [message="Success"] - Client notifications or alert text.
     * @param {number} [statusCode=200] - Response HTTP code.
     * @returns {Object} JSON standardized success payload structure.
     */
    static success(data = null, message = "Success", statusCode = 200) {
        return {
            success: true,
            message,
            data,
            statusCode,
            timestamp: new Date().toISOString()
        }
    }

    /**
     * Formats failure responses.
     * @param {string} [message="Error"] - Summary error message.
     * @param {number} [statusCode=500] - Target HTTP status.
     * @param {any} [error=null] - Detailed error contexts, stack elements, or list arrays.
     * @returns {Object} JSON standardized error structure.
     */
    static error(message = "Error", statusCode = 500, error = null) {
        return {
            success: false,
            message,
            error,
            statusCode,
            timestamp: new Date().toISOString()
        }
    }

    /**
     * Formats invalid input validation failures.
     * @param {any} [error=null] - Validation error issues array or sub-keys object.
     * @returns {Object} JSON standard bad request validation block.
     */
    static validationError(error = null) {
        return {
            success: false,
            message: 'Validation failed',
            error,
            statusCode: 400,
            timestamp: new Date().toISOString()
        }
    }

    /**
     * Formats paginated list outputs.
     * @param {any[]} [data=null] - Array of result elements.
     * @param {number} page - Current requested page.
     * @param {number} limit - Items limit size.
     * @param {number} total - Total records count.
     * @returns {Object} JSON standard pagination response format.
     */
    static paginated(data = null, page, limit, total) {
        return {
            success: true,
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            },
            timestamp: new Date().toISOString()
        }
    }
}

export default ResponseFormatter;