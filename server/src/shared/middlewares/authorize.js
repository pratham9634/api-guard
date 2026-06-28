/**
 * @file authorize.js
 * @description Authorization middleware factory.
 * Restricts access to endpoints based on user roles configured in req.user.
 */

import ResponseFormatter from "../utils/ResponseFormatter.js";

/**
 * Higher-order middleware function to restrict route access to specific roles.
 * @param {string[]} allowedRoles - Array of roles allowed to access this route (e.g. ['admin', 'client']).
 * If empty, any authenticated user is allowed.
 * @returns {Function} Express middleware function.
 */
const authorize = (allowedRoles=[]) => (req,res,next)=>{
     try {
        if (!req.user || !req.user.role) {
            return res.status(403).json(ResponseFormatter.error("Forbidden", 403))
        }

        // If no roles are specified, any authenticated user can proceed
        if (allowedRoles.length === 0) {
            return next()
        };

        // Check if user's role exists in the allowed list
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json(ResponseFormatter.error("Insufficient permissions", 403))
        }

        next()
    } catch (error) {
        return res.status(403).json(ResponseFormatter.error("Forbidden", 403))
    }
}

export default authorize;