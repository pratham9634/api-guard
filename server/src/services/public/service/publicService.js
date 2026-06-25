/**
 * @file publicService.js
 * @description Core service logic for onboarding.
 * Validates onboarding payload inputs, checks for existing requests to prevent duplicate submissions,
 * and saves prospective client records to MongoDB.
 */

import AccessRequest from "../../../shared/models/AccessRequest.js";
import AppError from "../../../shared/utils/AppError.js";
import logger from "../../../shared/config/logger.js";

/**
 * Service class performing onboarding/access request processes.
 */
export class PublicService {
    /**
     * Submits a new onboarding request. Checks for prior submissions with the same email.
     * Throws conflict errors if request is pending/approved, or a forbidden error if a past request was rejected.
     * 
     * @param {Object} data - Onboarding request form input.
     * @param {string} data.name - Registrant contact name.
     * @param {string} data.email - Registrant corporate email address.
     * @param {string} data.companyName - Client company name.
     * @param {string} data.useCase - Client proposed usage description text.
     * @returns {Promise<Object>} The generated and saved AccessRequest MongoDB model document instance.
     * @throws {AppError} 409 Conflict if duplicate request exists; 403 Forbidden if email was previously rejected.
     */
    async requestAccess(data) {
        try {
            const { name, email, companyName, useCase } = data;

            // Check if request already exists for this email address to enforce database uniqueness
            const existingRequest = await AccessRequest.findOne({ email });
            if (existingRequest) {
                if (existingRequest.status === "pending") {
                    throw new AppError("An access request is already pending for this email address.", 409);
                } else if (existingRequest.status === "approved") {
                    throw new AppError("An account already exists for this email.", 409);
                } else {
                    throw new AppError("Previous request for this email was rejected. Please contact support.", 403);
                }
            }

            const request = new AccessRequest({
                name,
                email,
                companyName,
                useCase
            });

            await request.save();
            logger.info(`New access request submitted from ${email} (${companyName})`);
            
            return request;
        } catch (error) {
            logger.error("Error in requestAccess service:", error);
            throw error;
        }
    }
}

export default new PublicService();
