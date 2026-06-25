/**
 * @file authenticate.js
 * @description Authentication middleware that verifies JWT cookies.
 * Extracts `authToken` from cookie, validates it against JWT_SECRET, and appends user payload to `req.user`.
 */

import config from "../config/index.js";
import ResponseFormatter from "../utils/responseFormatter.js";
import jwt from "jsonwebtoken";
import logger from "../config/logger.js"

/**
 * Express middleware to authenticate request using JSON Web Token (JWT) in cookies.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 * @returns {void}
 */
const authenticate = (req,res,next)=>{
    try{
        let token = null;

        // Try extracting authToken from cookie parser middleware
        if(req.cookies && req.cookies.authToken){
            token = req.cookies.authToken
        }

        // Return 401 if token is not present
        if (!token) {
            return res.status(401).json(ResponseFormatter.error("Authentication token is required", 401))
        }

        // Verify authenticity and signature of the token
        const decodedToken = jwt.verify(token, config.jwt.jwt_secret);

        // Attach parsed token details to the request object
        const { userId, email, username, role, clientId } = decodedToken;

        req.user = {
            userId, email, username, role, clientId
        }

        next();
    }
    catch (error) {
        logger.error("Authentication failed", {
            error: error.message,
            path: req.path
        });

        // Distinguish between expired tokens and other invalid token scenarios
        if (error.name === 'TokenExpiredError') {
            return res
                .status(401)
                .json(ResponseFormatter.error('Token expired', 401));
        }

        return res
            .status(401)
            .json(ResponseFormatter.error('Invalid token', 401));
    }
}
export default authenticate;
