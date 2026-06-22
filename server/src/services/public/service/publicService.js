import AccessRequest from "../../../shared/models/AccessRequest.js";
import AppError from "../../../shared/utils/AppError.js";
import logger from "../../../shared/config/logger.js";

export class PublicService {
    async requestAccess(data) {
        try {
            const { name, email, companyName, useCase } = data;

            // Check if request already exists for this email
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
