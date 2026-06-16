import config from "../../../shared/config/index.js";
import AppError from "../../../shared/utils/AppError.js";
import jwt from "jsonwebtoken";
import logger from "../../../shared/config/logger.js"
import bcrypt from "bcryptjs";
import { APPLICATION_ROLES ,isValidRole } from "../../../shared/constants/roles.js";

export class AuthService {
    constructor(userRepository){
        if (!userRepository) {
            throw new Error("UserRepository is Required");
        }
        this.userRepository = userRepository;
    }

     generateToken(user) {
        const { _id, email, username, role, clientId } = user;

        const payload = {
            userId: _id,
            username,
            email,
            role,
            clientId
        }

        return jwt.sign(payload, config.jwt.secret, {
            expiresIn: config.jwt.expiresIn
        })
    }

    formatUserForResponse(user) {
        const userObj = user.toObject ? user.toObject() : { ...user };
        delete userObj.password;
        return userObj;
    };

    async comparePassword(userEnteredPassword, hashedPassword) {
        return await bcrypt.compare(userEnteredPassword, hashedPassword)
    }

    async onboardSuperAdmin(superAdminData){
        try {
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

    async login(username, password) {
        try {
            const user = await this.userRepository.findByUsername(username);

            if (!user) {
                throw new AppError("Invliad Credentials", 401);
            };

            if (!user.isActive) {
                throw new AppError("Account is deactivated", 403);
            }

            const isPasswordValid = await this.comparePassword(password, user.password);
            if (!isPasswordValid) {
                throw new AppError("Invliad Credentials", 401);
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