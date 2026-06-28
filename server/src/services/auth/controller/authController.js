/**
 * @file authController.js
 * @description Controller for authentication routes.
 * Receives request payloads, invokes service handlers, sets auth cookies, and clears cookies on logout.
 */

import config from "../../../shared/config/index.js";
import { APPLICATION_ROLES } from "../../../shared/constants/roles.js";
import ResponseFormatter from "../../../shared/utils/ResponseFormatter.js"

/**
 * Controller class coordinating authentication actions.
 */
export class AuthController {
    /**
     * @param {AuthService} authService - Service layer class.
     */
    constructor(authService){
        if (!authService) {
            throw new Error("AuthService is Required");
        }
        this.authService = authService;
    }

    /**
     * Creates the initial system Super Admin and registers session cookie.
     * @param {import('express').Request} req - Express request.
     * @param {import('express').Response} res - Express response.
     * @param {import('express').NextFunction} next - Express next middleware.
     */
    async onboardSuperAdmin(req,res,next){
        try {
            const {username ,email,password} = req.body;
            const superAdminData = {
                username,
                email,
                password,
                role: APPLICATION_ROLES.SUPER_ADMIN
            }
            const {user,token} = await this.authService.onboardSuperAdmin(superAdminData);

            // Bind authentication JWT onto request cookie context
             res.cookie("authToken", token, {
                httpOnly: config.cookie.httpOnly,
                secure: config.cookie.secure,
                sameSite: config.cookie.sameSite,
                maxAge: config.cookie.maxAge
            });

            res.status(201).json(ResponseFormatter.success(user, "Super admin created successfully", 201))
        } catch (error) {
            next(error);
        }
    }

    /**
     * Creates new user accounts.
     * @param {import('express').Request} req - Express request.
     * @param {import('express').Response} res - Express response.
     * @param {import('express').NextFunction} next - Express next middleware.
     */
    async register(req, res, next) {
        try {
            const { username, email, password, role } = req.body;
            const userData = {
                username, email, password, role: role || APPLICATION_ROLES.CLIENT_VIEWER
            };

            const { token, user } = await this.authService.register(userData);

            res.cookie("authToken", token, {
                httpOnly: config.cookie.httpOnly,
                secure: config.cookie.secure,
                maxAge: config.cookie.expiresIn
            });

            res.status(201).json(ResponseFormatter.success(user, "User created successfully", 201))
        } catch (error) {
            next(error)
        }
    };

    /**
     * Authenticates existing user credentials and returns session cookie.
     * @param {import('express').Request} req - Express request.
     * @param {import('express').Response} res - Express response.
     * @param {import('express').NextFunction} next - Express next middleware.
     */
    async login(req, res, next) {
        try {
            const { username, password } = req.body;
            const { user, token } = await this.authService.login(username, password);

            res.cookie("authToken", token, {
                httpOnly: config.cookie.httpOnly,
                secure: config.cookie.secure,
                maxAge: config.cookie.expiresIn
            });

            res.status(200).json(ResponseFormatter.success(user, "User LoggedIn successfully", 200))
        } catch (error) {
            next(error)
        }
    };

    /**
     * Resolves the profile of the currently logged-in user.
     * @param {import('express').Request} req - Express request.
     * @param {import('express').Response} res - Express response.
     * @param {import('express').NextFunction} next - Express next middleware.
     */
    async getProfile(req, res, next) {
        try {
            const userId = req.user.userId;
            const result = await this.authService.getProfile(userId);

            res.status(200).json(ResponseFormatter.success(result, "Profile fetched successfully", 200))
        } catch (error) {
            next(error)
        }
    }

    /**
     * Clears authentication session cookie.
     * @param {import('express').Request} req - Express request.
     * @param {import('express').Response} res - Express response.
     * @param {import('express').NextFunction} next - Express next middleware.
     */
     async logout(req, res, next) {
        try {
            res.clearCookie("authToken")
            res.status(200).json(ResponseFormatter.success({}, "Logout successful", 200))
        } catch (error) {
            next(error)
        }
    }

    /**
     * Updates logged-in user profile attributes.
     * @param {import('express').Request} req - Express request.
     * @param {import('express').Response} res - Express response.
     * @param {import('express').NextFunction} next - Express next middleware.
     */
    async updateProfile(req, res, next) {
        try {
            const userId = req.user.userId;
            const updatedUser = await this.authService.updateProfile(userId, req.body);
            return res.status(200).json(ResponseFormatter.success(updatedUser, "Profile updated successfully", 200));
        } catch (error) {
            next(error);
        }
    }

}
