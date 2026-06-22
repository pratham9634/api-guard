import publicService from "../service/publicService.js";
import ResponseFormatter from "../../../shared/utils/responseFormatter.js";
import logger from "../../../shared/config/logger.js";

export class PublicController {
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
