/**
 * @file publicController.js
 * @description Controller implementation for public onboarding endpoints.
 * Handles client registration request payload routing.
 */

import publicService from "../service/publicService.js";
import ResponseFormatter from "../../../shared/utils/responseFormatter.js";
import logger from "../../../shared/config/logger.js";

/**
 * Controller class that routes HTTP payloads into the onboarding request service.
 */
export class PublicController {
    /**
     * Express endpoint router that processes a prospective client registration request.
     * 
     * @param {import('express').Request} req - Express request object.
     * @param {import('express').Response} res - Express response object.
     * @param {import('express').NextFunction} next - Express next middleware function.
     * @returns {Promise<void>}
     */
    async requestAccess(req, res, next) {
        try {
            const request = await publicService.requestAccess(req.body);
            res.status(201).json(ResponseFormatter.success("Access request submitted successfully. We will review it shortly.", request));
        } catch (error) {
            next(error);
        }
    }
}

export default new PublicController();
