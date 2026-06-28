/**
 * @file validate.js
 * @description Dynamic request body validation middleware.
 * Validates request payload against a rules object (supporting required, minLength, and custom logic validations).
 */

import ResponseFormatter from "../utils/ResponseFormatter.js"

/**
 * Higher-order middleware function to validate the request body against a specified rules schema.
 * @param {Object} schema - Validation schema mapping payload fields to rule checks.
 * @param {boolean} [schema.[field].required] - Whether the field is mandatory.
 * @param {number} [schema.[field].minLength] - Minimum string length constraints.
 * @param {Function} [schema.[field].custom] - Custom callback `(value, body) => string|null` returning an error message if invalid.
 * @returns {Function} Express middleware function.
 */
const validate = (schema) => (req, res, next) => {
    // If no schema is passed, bypass validation
    if (!schema) {
        return next()
    }

    const errors = [];
    const body = req.body || {};

    // Validate each field key against constraints
    Object.entries(schema).forEach(([field, rules]) => {
        const value = body[field] 

        // Validate presence if field is required
        if (rules.required && (value === undefined || value === null || value === "")) {
            errors.push(`${field} is required`)
            return
        };

        // Validate string length minimum limit
        if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
            errors.push(`${field} must be at least ${rules.minLength} characters`);
        }

        // Execute custom validation routine if specified
        if (rules.custom && typeof rules.custom === 'function') {
            const customErr = rules.custom(value, body);
            if (customErr) errors.push(customErr);
        }
    })

    // If validation fails, return 400 Bad Request with all accumulated errors
    if (errors.length) {
        return res.status(400).json(ResponseFormatter.error("Validation failed", 400, errors))
    }

    next()
}

export default validate