/**
 * @file UserRepository.js
 * @description MongoDB repository for User model management.
 * Implements BaseRepository interfaces to handle query, write, and deletion procedures.
 */

import BaseRepository from "./BaseRepository.js";
import User from "../../../shared/models/User.js"
import logger from "../../../shared/config/logger.js"

/**
 * Mongo-specific User Repository subclass.
 * @extends BaseRepository
 */
class MongoUserRepository extends BaseRepository {
    constructor() {
        super(User)
    }

    /**
     * Creates a new user record. If user role is super_admin, initializes global permission flags.
     * @param {Object} userData - User registration data.
     * @returns {Promise<User>} The created User mongoose document.
     */
    async create(userData) {
        try {
            let data = { ...userData }
            // Auto-grant full permission options to super admins
            if (data.role === "super_admin" && !data.permissions) {
                data.permissions = {
                    canCreateApiKeys: true,
                    canManageUsers: true,
                    canViewAnalytics: true,
                    canExportData: true,
                }
            }

            const user = new this.model(data);
            await user.save();

            logger.info("User created", { username: user.username });
            return user
        } catch (error) {
            logger.error("Error creating user", error)
            throw error;
        }
    }

    /**
     * Looks up user by primary key ObjectId.
     * @param {string} userId - User identifier.
     * @returns {Promise<User|null>}
     */
    async findById(userId) {
        try {
            const user = await this.model.findById(userId)
            return user
        } catch (error) {
            logger.error("Error finding user by id", error)
            throw error;
        }
    }

    /**
     * Queries user document matching username value.
     * @param {string} username - User account name.
     * @returns {Promise<User|null>}
     */
    async findByUsername(username) {
        try {
            const user = await this.model.findOne({ username })
            return user
        } catch (error) {
            logger.error("Error finding user by username", error)
            throw error;
        }
    }

    /**
     * Queries user document matching email.
     * @param {string} email - Email address value.
     * @returns {Promise<User|null>}
     */
    async findByEmail(email) {
        try {
            const user = await this.model.findOne({ email })
            return user
        } catch (error) {
            logger.error("Error finding user by email", error)
            throw error;
        }
    }

    /**
     * Lists active users, returning payload profiles without hashed passwords.
     * @returns {Promise<User[]>} Array of active users.
     */
    async findAll() {
        try {
            const user = await this.model.find({ isActive: true }).select("-password")
            return user
        } catch (error) {
            logger.error("Error finding active users", error)
            throw error;
        }
    }

    /**
     * Lists active users belonging to a specific client organization. Excludes passwords from projection.
     * @param {string} clientId - Organization scope.
     * @returns {Promise<User[]>} Array of user documents.
     */
    async findByClientId(clientId){
        try{
            const user = await this.model.find({clientId:clientId}).select("-password");
            
            return user;
        } catch(error){
            logger.error("Error finding user by client id", error)
            throw error;
        }
    }

    /**
     * Lists all system users including suspended/inactive profiles.
     * @returns {Promise<User[]>}
     */
    async findAllWithInactive() {
        try {
            const users = await this.model.find().select("-password");
            return users;
        } catch (error) {
            logger.error("Error finding all users including inactive", error);
            throw error;
        }
    }

    /**
     * Hard deletes a user matching userId.
     * @param {string} userId - User identifier.
     */
    async deleteById(userId) {
        try {
            await this.model.findByIdAndDelete(userId);
        } catch (error) {
            logger.error("Error deleting user by id", error);
            throw error;
        }
    }

    /**
     * Hard deletes all users tied to a client organization.
     * @param {string} clientId - Client organization reference.
     */
    async deleteByClientId(clientId) {
        try {
            await this.model.deleteMany({ clientId: clientId });
        } catch (error) {
            logger.error("Error deleting users by client id", error);
            throw error;
        }
    }
}

export default new MongoUserRepository()