/**
 * @file authRouter.js
 * @description Registers HTTP endpoints for onboard, register, login, profile, and logout actions.
 * Integrates validator schema middlewares, request profiling logging, and role verification middleware hooks.
 */

import express from "express";
import dependencies from "../Dependencies/dependencies.js"
import authorize from "../../../shared/middlewares/authorize.js"
import authenticate from "../../../shared/middlewares/authenticate.js"
import validate from "../../../shared/middlewares/validate.js";
import requestLogger from "../../../shared/middlewares/requestLogger.js";
import { onboardSuperAdminSchema, loginSchema, registrationSchema } from "../validation/authSchema.js";
import { APPLICATION_ROLES } from "../../../shared/constants/roles.js";

const router = express.Router();
const { controller } = dependencies;
const authController = controller.authController

// Onboard system super-admin (only allowed if zero users exist in database)
router.post("/onboard-super-admin",
    requestLogger,
    validate(onboardSuperAdminSchema),
    (req, res, next) => authController.onboardSuperAdmin(req, res, next)
)

// Register a new user under client tenant (Super Admin restricted)
router.post("/register",
    requestLogger,
    authenticate,
    authorize([APPLICATION_ROLES.SUPER_ADMIN]),
    validate(registrationSchema),
    (req, res, next) => authController.register(req, res, next)
)

// Authenticate credentials and receive token session cookie
router.post("/login",
    requestLogger,
    validate(loginSchema),
    (req, res, next) => authController.login(req, res, next)
);

// Get current logged-in user profile
router.get("/profile",
    requestLogger,
    authenticate,
    (req, res, next) => authController.getProfile(req, res, next)
)

// Terminate user session cookie
router.get("/logout",
    requestLogger,
    (req, res, next) => authController.logout(req, res, next)
)

// Edit profile details of current user
router.put("/profile",
    requestLogger,
    authenticate,
    (req, res, next) => authController.updateProfile(req, res, next)
)

export default router