/**
 * @file requestLogger.js
 * @description Inbound HTTP request timing and logging middleware.
 * Computes execution duration by hooking into the response's 'finish' event.
 */

import logger from '../config/logger.js';

/**
 * Express middleware that hooks into response lifecycle.
 * Logs HTTP verb, path, origin IP, result status code, and latency in milliseconds.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 */
const requestLogger = (req, res, next) => {
    const start = Date.now();

    // Hook to run after the response has been sent to the client
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info('HTTP %s %s %s %dms', req.method, req.originalUrl || req.url, req.ip || req.socket.remoteAddress, duration, {
            method: req.method,
            path: req.originalUrl || req.url,
            status: res.statusCode,
            duration,
        });
    });

    next();
};

export default requestLogger;