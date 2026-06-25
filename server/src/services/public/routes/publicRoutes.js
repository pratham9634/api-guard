/**
 * @file publicRoutes.js
 * @description Defines public access/sign-up routing rules for onboarding external clients.
 */

import express from "express";
import publicController from "../controller/publicController.js";

const router = express.Router();

/**
 * @route POST /api/public/request-access
 * @desc Submits onboarding access request details.
 * @access Public
 */
router.post("/request-access", (req, res, next) => publicController.requestAccess(req, res, next));

export default router;
