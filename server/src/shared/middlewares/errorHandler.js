/**
 * @file errorHandler.js
 * @description Centralized error handler middleware.
 * Intercepts errors thrown in express handlers, logs their contexts, translates them into standard HTTP status codes,
 * and formats the JSON response payload uniformly using ResponseFormatter.
 */

import logger from "../config/logger.js";
import ResponseFormatter from "../utils/responseFormatter.js";

/**
 * Global error handler middleware for Express.
 * Catches all errors from preceding middlewares and routes.
 * Handles specific known errors like ValidationError, MongoServerError (e.g., duplicates), JWT errors, and falls back to a 500 status.
 * @param {Error} err - Error object.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next function.
 */
async function errorHandler(err, req, res, next) {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    let error = err.error || null;

    // Log the caught error details
    logger.error("Error occurred",{
        message : err.message,
        stack : err.stack,
        statusCode : statusCode,
        path : req.path,
        method : req.method,
    })

    // Map database/auth exceptions to standard status codes & user-friendly messages
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = "Validation Error";
        error = Object.values(err.errors).map((e) => e.message)
    } else if (err.name === 'MongoServerError' && err.code === 11000) {
        statusCode = 409;
        message = 'Duplicate key error';
    } else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    } else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    };
    
    // Send formatted standard error response
    res.status(statusCode).json(ResponseFormatter.error(message,statusCode,error));
    
}

export default errorHandler;