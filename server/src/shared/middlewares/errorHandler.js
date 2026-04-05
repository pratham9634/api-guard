import logger from "../config/logger.js";
import ResponseFormatter from "../utils/ResponseFormatter.js";

async function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    const error = err.error || null;

    logger.error("Error occured",{
        message : err.message,
        stack : err.stack,
        statusCode : statusCode,
        path : req.path,
        method : req.method,
    })

    if (err.name === "ValidationError") {
        statusCode = 400;
        message = "Validation Error";
        errors = Object.values(err.errors).map((e) => e.message)
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
    
    res.status(statusCode).json(ResponseFormatter.error(message,statusCode,error));
    
}

export default errorHandler;