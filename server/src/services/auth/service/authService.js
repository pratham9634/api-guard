/**
 * @file authService.js
 * @description Authentication service business logic.
 * Manages user logins, profile registrations, credentials password comparison, JWT generation,
 * organization-level permission configurations, and user activation states.
 */

import config from "../../../shared/config/index.js";
import AppError from "../../../shared/utils/AppError.js";
import jwt from "jsonwebtoken";
import logger from "../../../shared/config/logger.js"
import bcrypt from "bcryptjs";
import { APPLICATION_ROLES ,isValidRole } from "../../../shared/constants/roles.js";

/**
 * Service class performing user registration, logins, profile edits, and role adjustments.
 */
export class AuthService {
    /**
     * @param {Object} userRepository - Database accessor repository.
     */
    constructor(userRepository){
        if (!userRepository) {
            throw new Error("UserRepository is Required");
        }
        this.userRepository = userRepository;
    }

    /**
     * Encrypts user identity payload into a secure JSON Web Token (JWT).
     * @param {User} user - User model object.
     * @returns {string} Signed JWT.
     */
     generateToken(user) {
        const { _id, email, username, role, clientId } = user;

        const payload = {
            userId: _id,
            username,
            email,
            role,
            clientId
        }

        return jwt.sign(payload, config.jwt.jwt_secret, {
            expiresIn: config.jwt.jwt_expires_in
        })
    }

    /**
     * Strips critical properties (e.g., password hash) from User payload objects before sending to clients.
     * @param {User} user - User entity.
     * @returns {Object} JSON user details.
     */
    formatUserForResponse(user) {
        const userObj = user.toObject ? user.toObject() : { ...user };
        delete userObj.password;
        return userObj;
    };

    /**
     * Compares entered password with bcrypt hash string.
     * @param {string} userEnteredPassword - Plain credentials password.
     * @param {string} hashedPassword - Hashed candidate.
     * @returns {Promise<boolean>} Match status.
     */
    async comparePassword(userEnteredPassword, hashedPassword) {
        return await bcrypt.compare(userEnteredPassword, hashedPassword)
    }

    /**
     * Provisions the initial system Super Admin. Disabled if any users already exist.
     * @param {Object} superAdminData - Registration details.
     * @returns {Promise<{user: Object, token: string}>} Formatted user object and active JWT.
     */
    async onboardSuperAdmin(superAdminData){
        try {
            // Lock onboarding if system is already set up with an active user account
            const existingUser = await this.userRepository.findAll();
            if(existingUser.length>0){
                throw new AppError("Super Admin Onboarding is disabled",403)
            }

            const user = await this.userRepository.create(superAdminData);
            const token = this.generateToken(user);

            logger.info("Admin onboarded successfully", {
                username: user.username
            })

            return {
                user : this.formatUserForResponse(user),
                token
            }
        } catch (error) {
            logger.error("Error in onboarding Super admin", error)
            throw error
        }
    }

    /**
     * Registers a new organization user. Enforces email/username uniqueness checks.
     * @param {Object} userData - Registration payload details.
     * @returns {Promise<{user: Object, token: string}>}
     */
    async register(userData) {
        try {
            const existingUser = await this.userRepository.findByUsername(userData.username)
            if (existingUser) {
                throw new AppError("Username already exists", 409)
            };

            const existingEmail = await this.userRepository.findByEmail(userData.email)
            if (existingEmail) {
                throw new AppError("Email already exists", 409)
            };

            const user = await this.userRepository.create(userData);
            const token = this.generateToken(user);

            logger.info("User registered successfully", {
                username: user.username
            })

            return {
                user: this.formatUserForResponse(user),
                token
            }
        } catch (error) {
            logger.error("Error in Register service", error)
            throw error
        }
    };

    /**
     * Validates user credentials. Generates authentication token.
     * @param {string} username - Account login username.
     * @param {string} password - Account login credentials.
     * @returns {Promise<{user: Object, token: string}>}
     */
    async login(username, password) {
        try {
            const user = await this.userRepository.findByUsername(username);

            if (!user) {
                throw new AppError("Invalid Credentials", 401);
            };

            // Deny login if user status is suspended/deactivated
            if (!user.isActive) {
                throw new AppError("Account is deactivated", 403);
            }

            const isPasswordValid = await this.comparePassword(password, user.password);
            if (!isPasswordValid) {
                throw new AppError("Invalid Credentials", 401);
            }
            const token = this.generateToken(user);

            logger.info("User loggedIn successfully", { username: user.username })

            return {
                user: this.formatUserForResponse(user),
                token
            }

        } catch (error) {
            logger.error("Error in Login service", error)
            throw error
        }
    };

    /**
     * Retrieves user profile details.
     * @param {string} userId - User identifier.
     * @returns {Promise<Object>} Formatted user.
     */
     async getProfile(userId) {
        try {
            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new AppError('User not found', 404);
            }
            return this.formatUserForResponse(user)
        } catch (error) {
            logger.error('Error getting user profile:', error);
            throw error;
        }
    };

    /**
     * Checks if a user possesses global platform admin status.
     * @param {string} userId - User identifier.
     * @returns {Promise<boolean>}
     */
    async checkSuperAdminPermissions(userId) {
        try {
            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new AppError("User not found", 404);
            }

            return user.role === APPLICATION_ROLES.SUPER_ADMIN
        } catch (error) {
            logger.error("Error in checking super admin permissions", error)
            throw error
        }
    };

    /**
     * Update logged in user's profile details
     * @param {String} userId - The user ID to update
     * @param {Object} updateData - Fields to update (username, email, password)
     * @returns {Promise<Object>} - Formatted user object
     */
    async updateProfile(userId, updateData) {
        try {
            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new AppError("User not found", 404);
            }

            if (updateData.username) {
                const existingUser = await this.userRepository.findByUsername(updateData.username);
                if (existingUser && existingUser._id.toString() !== userId.toString()) {
                    throw new AppError("Username already exists", 409);
                }
                user.username = updateData.username;
            }

            if (updateData.email) {
                const existingEmail = await this.userRepository.findByEmail(updateData.email);
                if (existingEmail && existingEmail._id.toString() !== userId.toString()) {
                    throw new AppError("Email already exists", 409);
                }
                user.email = updateData.email;
            }

            if (updateData.password) {
                user.password = updateData.password; // Auto-hashed by userSchema.pre('save') hook
            }

            await user.save();
            return this.formatUserForResponse(user);
        } catch (error) {
            logger.error("Error updating profile:", error);
            throw error;
        }
    }

    /**
     * List all system users (super_admin only)
     * @param {Object} adminUser - Executing user details.
     * @returns {Promise<Array>}
     */
    async getAllUsers(adminUser) {
        try {
            if (adminUser.role !== APPLICATION_ROLES.SUPER_ADMIN) {
                throw new AppError("Access denied - Super Admin only", 403);
            }

            const users = await this.userRepository.findAllWithInactive();
            return users;
        } catch (error) {
            logger.error("Error listing all users:", error);
            throw error;
        }
    }

    /**
     * Activate or deactivate a user status
     * @param {string} userId - User to toggle.
     * @param {boolean} isActive - Target state.
     * @param {Object} adminUser - Requesting administrator.
     * @returns {Promise<Object>} Updated profile details.
     */
    async updateUserStatus(userId, isActive, adminUser) {
        try {
            if (adminUser.role !== APPLICATION_ROLES.SUPER_ADMIN) {
                throw new AppError("Access denied - Super Admin only", 403);
            }

            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new AppError("User not found", 404);
            }

            user.isActive = isActive;
            await user.save();
            return this.formatUserForResponse(user);
        } catch (error) {
            logger.error("Error updating user status:", error);
            throw error;
        }
    }

    /**
     * Update user role and dynamically adjust permissions
     * @param {string} userId - Target user identifier.
     * @param {string} role - Target role value.
     * @param {Object} adminUser - Requesting administrator.
     * @returns {Promise<Object>} Updated user.
     */
    async updateUserRole(userId, role, adminUser) {
        try {
            if (adminUser.role !== APPLICATION_ROLES.SUPER_ADMIN) {
                throw new AppError("Access denied - Super Admin only", 403);
            }

            if (!isValidRole(role)) {
                throw new AppError("Invalid role specified", 400);
            }

            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new AppError("User not found", 404);
            }

            user.role = role;

            // Dynamically adjust default permissions based on the new role
            if (role === APPLICATION_ROLES.SUPER_ADMIN || role === APPLICATION_ROLES.CLIENT_ADMIN) {
                user.permissions = {
                    canCreateApiKeys: true,
                    canManageUsers: true,
                    canViewAnalytics: true,
                    canExportData: true,
                };
            } else {
                user.permissions = {
                    canCreateApiKeys: false,
                    canManageUsers: false,
                    canViewAnalytics: true,
                    canExportData: false,
                };
            }

            await user.save();
            return this.formatUserForResponse(user);
        } catch (error) {
            logger.error("Error updating user role:", error);
            throw error;
        }
    }

}