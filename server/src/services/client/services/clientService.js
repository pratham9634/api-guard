
import logger from "../../../shared/config/logger.js";
import { APPLICATION_ROLES, isValidClientRole } from "../../../shared/constants/roles.js";
import AppError from "../../../shared/utils/AppError.js";
import { v4 as uudiv4 } from "uuid";
import crypto from 'crypto';
import AccessRequest from "../../../shared/models/AccessRequest.js";
import emailService from "../../../shared/services/emailService.js";

/**
 * ClientService class to handle business logic related to clients
 * This class is responsible for creating clients, managing client users, and handling API keys for clients. It interacts with the client repository, API key repository, and user repository to perform these operations.
 */
export class ClientService {
    /**
     * Constructor for ClientService
     * @param {Object} dependencies - An object containing the required dependencies
     * @param {Object} dependencies.clientRepository - The client repository instance
     * @param {Object} dependencies.apiKeyRepository - The API key repository instance
     * @param {Object} dependencies.userRepository - The user repository instance
     * @throws Will throw an error if any of the required dependencies are missing
     */
    constructor(dependencies) {
        if (!dependencies) {
            throw new Error('Dependencies are required');
        };

        if (!dependencies.clientRepository) {
            throw new Error('ClientRepository is required');
        };

        if (!dependencies.apiKeyRepository) {
            throw new Error('ApiKeyRepository is required');
        }
        if (!dependencies.userRepository) {
            throw new Error('UserRepository is required');
        }

        // Assign dependencies to instance variables
        this.clientRepository = dependencies.clientRepository;
        this.apiKeyRepository = dependencies.apiKeyRepository;
        this.userRepository = dependencies.userRepository;
    };

    /**
     * Format client object for response by removing sensitive information
     * @param {Object} user - The client user object
     * @returns {Object} - The formatted client user object
     */
    formatClientForResponse(user) {
        const userObj = user.toObject ? user.toObject() : { ...user };
        delete userObj.password;
        return userObj;
    };

    /**
     * Generate unique slug from name
     * @param {String} name - The name to generate the slug from
     * @returns {String} - The generated slug
     */
    generateSlug(name) {
        return name.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim()
    }

    /**
     * Create a new client
     * @param {Object} clientData - The client data
     * @param {Object} adminUser - The admin user creating the client
     * @returns {Object} - The created client
     */
    async createClient(clientData, adminUser) {
        try {
            const { name, email, description, website } = clientData;

            const slug = this.generateSlug(name);

            const exisitingClient = await this.clientRepository.findBySlug(slug);

            if (exisitingClient) {
                throw new AppError(`Client with slug ${slug} already exists`, 400);
            }

            const client = await this.clientRepository.create({
                name,
                slug,
                email,
                description,
                website,
                createdBy: adminUser.userId
            });

            return client;
        } catch (error) {
            logger.error('Error creating client:', error);
            throw error;
        }
    };

    /**
     * Check if a user has access to a specific client
     * @param {Object} user - The user object
     * @param {String} clientId - The client ID
     * @returns {Boolean} - True if the user has access, false otherwise
     */
    canUserAccessClient(user, clientId) {
        if (user.role === APPLICATION_ROLES.SUPER_ADMIN) {
            return true
        }

        return user.clientId && user.clientId.toString() === clientId.toString()
    }

    /**
     * Create a new client user for a specific client
     * @param {String} clientId - The client ID
     * @param {Object} userData - The user data
     * @param {Object} adminUser - The admin user creating the client user
     * @returns {Object} - The created client user
     */
    async createClientUser(clientId, userData, adminUser) {
        try {
            if (!this.canUserAccessClient(adminUser, clientId)) {
                throw new AppError("Access denied", 403)
            };

            if (!(adminUser.role === APPLICATION_ROLES.SUPER_ADMIN || adminUser.role === APPLICATION_ROLES.CLIENT_ADMIN)) {
                throw new AppError("Access denied - Only Super Admin and Client Admin can manage users", 403)
            };

            const { username, email, password, role = APPLICATION_ROLES.CLIENT_VIEWER } = userData;

            if (!isValidClientRole(role)) {
                throw new AppError("Invalid role for client user", 400)
            };

            const client = await this.clientRepository.findById(clientId);

            if (!client) {
                throw new AppError("Client not found", 404)
            };

            // Set permissions based on role
            let permissions = {
                canCreateApiKeys: false,
                canManageUsers: false,
                canViewAnalytics: true,
                canExportData: false,
            };

            // If the role is client admin, update permissions accordingly
            if (role === APPLICATION_ROLES.CLIENT_ADMIN) {
                permissions = {
                    canCreateApiKeys: true,
                    canManageUsers: true,
                    canViewAnalytics: true,
                    canExportData: true,
                }
            };

            const user = await this.userRepository.create({
                username,
                email,
                password,
                role,
                clientId,
                permissions
            });

            logger.info("Client user created", {
                clientId,
                userId: user._id,
                role
            })

            return this.formatClientForResponse(user)

        } catch (error) {
            logger.error("Error creating client user", error)
            throw error;
        }
    };

    /**
     * Generate a new API key
     * @returns {String} - The generated API key
     */
    generateApiKey() {
        const prefix = "apim";
        const randomBytes = crypto.randomBytes(20).toString("hex");
        return `${prefix}_${randomBytes}`
    }

    /**
     * Create a new API key for a specific client
     * @param {String} clientId - The client ID
     * @param {Object} keyData - The API key data
     * @param {Object} user - The user creating the API key
     * @returns {Object} - The created API key
     */
    async createApiKey(clientId, keyData, user) {
        try {
            const client = await this.clientRepository.findById(clientId);

            if (!client) {
                throw new AppError("Client not found", 404)
            };

            if (!this.canUserAccessClient(user, clientId)) {
                throw new AppError("Access denied", 403)
            };

            if (!(user.role === APPLICATION_ROLES.SUPER_ADMIN || user.role === APPLICATION_ROLES.CLIENT_ADMIN)) {
                throw new AppError("Access denied - Only Super Admin and Client Admin can create API keys", 403)
            };


            const { name, description, environment = "production" } = keyData;

            const keyId = uudiv4();
            const keyValue = this.generateApiKey();

            const apiKey = await this.apiKeyRepository.create({
                keyId,
                keyValue,
                clientId,
                name,
                description,
                environment,
                createdBy: user.userId
            });

            return apiKey;
        } catch (error) {
            logger.error("Error creating API key", error)
            throw error;
        }
    };


    /**
     * Get all API keys for a specific client
     * @param {String} clientId - The client ID
     * @param {Object} user - The user requesting the API keys
     * @returns {Array} - The list of API keys
     */
    async getClientApiKeys(clientId, user) {
        try {
            if (!this.canUserAccessClient(user, clientId)) {
                throw new AppError('Access denied to this client', 403);
            };

            const apiKeys = await this.apiKeyRepository.findByClientId(clientId);

            const formattedResponse = apiKeys.map(key => {
                const keyObj = key.toObject ? key.toObject() : key;
                delete keyObj.keyValue;
                return keyObj
            })

            return formattedResponse

        } catch (error) {
            logger.error('Error getting client API keys:', error);
            throw error;
        }
    }

     async getClientByApiKey(apiKey) {
        try {
            const key = await this.apiKeyRepository.findByKeyValue(apiKey);

            if (!key) {
                return null;
            }

            if (key.isExpired()) {
                return null;
            }

            // Get the populated client from the key
            const client = key.clientId;

            return {
                client,
                apiKey: key,
            };
        } catch (error) {
            logger.error('Error finding client by API key:', error);
            throw error;
        }
    }


        /**
     * Get all clients or user's own client
     * @param {Object} user - The logged in user
     * @returns {Promise<Array>} - List of clients
     */
    async getClients(user) {
        try {
            if (user.role === APPLICATION_ROLES.SUPER_ADMIN) {
                return await this.clientRepository.find({ isActive: true });
            }

            // Client users (admin, viewer) can only see their own client
            if (!user.clientId) {
                return [];
            }
            const client = await this.clientRepository.findById(user.clientId);
            return client ? [client] : [];
        } catch (error) {
            logger.error('Error getting clients:', error);
            throw error;
        }
    }

    /**
     * Get details of a single client
     * @param {String} clientId - The client ID
     * @param {Object} user - The logged in user
     * @returns {Promise<Object>} - The client details
     */
    async getClientById(clientId, user) {
        try {
            if (!this.canUserAccessClient(user, clientId)) {
                throw new AppError("Access denied", 403);
            }

            const client = await this.clientRepository.findById(clientId);
            if (!client) {
                throw new AppError("Client not found", 404);
            }

            return client;
        } catch (error) {
            logger.error('Error getting client details:', error);
            throw error;
        }
    }

    /**
     * Update client details
     * @param {String} clientId - The client ID
     * @param {Object} updateData - Data to update (name, description, settings, website, email)
     * @param {Object} user - The logged in user
     * @returns {Promise<Object>} - The updated client
     */
    async updateClient(clientId, updateData, user) {
        try {
            const isSuperAdmin = user.role === APPLICATION_ROLES.SUPER_ADMIN;
            const isClientAdmin = user.role === APPLICATION_ROLES.CLIENT_ADMIN && 
                                  user.clientId && user.clientId.toString() === clientId.toString();

            if (!isSuperAdmin && !isClientAdmin) {
                throw new AppError("Access denied - Insufficient permissions to update client", 403);
            }

            const client = await this.clientRepository.findById(clientId);
            if (!client) {
                throw new AppError("Client not found", 404);
            }

            const fieldsToUpdate = {};

            // Regenerate slug if name changes and ensure unique slug
            if (updateData.name && updateData.name !== client.name) {
                const slug = this.generateSlug(updateData.name);
                const existingClient = await this.clientRepository.findBySlug(slug);
                if (existingClient && existingClient._id.toString() !== clientId.toString()) {
                    throw new AppError(`Client with slug ${slug} already exists`, 400);
                }
                fieldsToUpdate.name = updateData.name;
                fieldsToUpdate.slug = slug;
            }

            if (updateData.description !== undefined) {
                fieldsToUpdate.description = updateData.description;
            }

            if (updateData.website !== undefined) {
                fieldsToUpdate.website = updateData.website;
            }

            if (updateData.email !== undefined) {
                fieldsToUpdate.email = updateData.email;
            }

            if (updateData.settings) {
                fieldsToUpdate.settings = {
                    ...client.settings,
                    ...updateData.settings
                };
            }

            const updatedClient = await this.clientRepository.update(clientId, fieldsToUpdate);
            return updatedClient;
        } catch (error) {
            logger.error('Error updating client:', error);
            throw error;
        }
    }

    /**
     * Deactivate client (soft delete)
     * @param {String} clientId - The client ID
     * @param {Object} user - The logged in user
     * @returns {Promise<Object>} - The updated client
     */
    async deactivateClient(clientId, user) {
        try {
            if (user.role !== APPLICATION_ROLES.SUPER_ADMIN) {
                throw new AppError("Access denied - Only Super Admin can deactivate clients", 403);
            }

            const client = await this.clientRepository.findById(clientId);
            if (!client) {
                throw new AppError("Client not found", 404);
            }

            const updatedClient = await this.clientRepository.update(clientId, { isActive: false });
            return updatedClient;
        } catch (error) {
            logger.error('Error deactivating client:', error);
            throw error;
        }
    }

    /**
     * List users belonging to a specific client
     * @param {String} clientId - The client ID
     * @param {Object} user - The logged in user
     * @returns {Promise<Array>} - List of client users
     */
    async getClientUsers(clientId, user) {
        try {
            if (!this.canUserAccessClient(user, clientId)) {
                throw new AppError("Access denied", 403);
            }

            const client = await this.clientRepository.findById(clientId);
            if (!client) {
                throw new AppError("Client not found", 404);
            }

            const users = await this.userRepository.findByClientId(clientId);
            return users;
        } catch (error) {
            logger.error('Error getting client users:', error);
            throw error;
        }
    }

        /**
     * Helper to validate API key management permission
     */
    validateApiKeyPermission(clientId, user) {
        if (!this.canUserAccessClient(user, clientId)) {
            throw new AppError("Access denied", 403);
        }

        if (!(user.role === APPLICATION_ROLES.SUPER_ADMIN || user.role === APPLICATION_ROLES.CLIENT_ADMIN)) {
            throw new AppError("Access denied - Only Super Admin and Client Admin can manage API keys", 403);
        }
    }

    /**
     * Revoke/deactivate an API key
     * @param {String} clientId - The client ID
     * @param {String} keyId - The API key external ID (UUID)
     * @param {Object} user - The logged in user
     * @returns {Promise<Object>} - The updated API key
     */
    async revokeApiKey(clientId, keyId, user) {
        try {
            this.validateApiKeyPermission(clientId, user);

            const apiKey = await this.apiKeyRepository.findByKeyId(keyId);
            if (!apiKey || apiKey.clientId._id.toString() !== clientId.toString()) {
                throw new AppError("API Key not found for this client", 404);
            }

            const updatedKey = await this.apiKeyRepository.update(keyId, { isActive: false });
            return updatedKey;
        } catch (error) {
            logger.error("Error revoking API key:", error);
            throw error;
        }
    }

    /**
     * Rotate an API key (generate new value, updates security.lastRotated)
     * @param {String} clientId - The client ID
     * @param {String} keyId - The API key external ID (UUID)
     * @param {Object} user - The logged in user
     * @returns {Promise<Object>} - The rotated API key
     */
    async rotateApiKey(clientId, keyId, user) {
        try {
            this.validateApiKeyPermission(clientId, user);

            const apiKey = await this.apiKeyRepository.findByKeyId(keyId);
            if (!apiKey || apiKey.clientId._id.toString() !== clientId.toString()) {
                throw new AppError("API Key not found for this client", 404);
            }

            const newKeyValue = this.generateApiKey();
            const updateFields = {
                keyValue: newKeyValue,
                "security.lastRotated": new Date()
            };

            const rotatedKey = await this.apiKeyRepository.update(keyId, updateFields);
            return rotatedKey;
        } catch (error) {
            logger.error("Error rotating API key:", error);
            throw error;
        }
    }

    /**
     * Delete an API key
     * @param {String} clientId - The client ID
     * @param {String} keyId - The API key external ID (UUID)
     * @param {Object} user - The logged in user
     * @returns {Promise<Boolean>} - True if deleted successfully
     */
    async deleteApiKey(clientId, keyId, user) {
        try {
            this.validateApiKeyPermission(clientId, user);

            const apiKey = await this.apiKeyRepository.findByKeyId(keyId);
            if (!apiKey || apiKey.clientId._id.toString() !== clientId.toString()) {
                throw new AppError("API Key not found for this client", 404);
            }

            const deleted = await this.apiKeyRepository.delete(keyId);
            return deleted;
        } catch (error) {
            logger.error("Error deleting API key:", error);
            throw error;
        }
    }

    // --- Access Requests Admin Methods ---

    async getAccessRequests(adminUser) {
        if (adminUser.role !== APPLICATION_ROLES.SUPER_ADMIN) {
            throw new AppError("Access denied - Super Admin only", 403);
        }
        return await AccessRequest.find().sort({ createdAt: -1 });
    }

    async approveAccessRequest(requestId, adminUser) {
        try {
            if (adminUser.role !== APPLICATION_ROLES.SUPER_ADMIN) {
                throw new AppError("Access denied - Super Admin only", 403);
            }

            const request = await AccessRequest.findById(requestId);
            if (!request) {
                throw new AppError("Access request not found", 404);
            }

            if (request.status !== "pending") {
                throw new AppError(`Access request is already ${request.status}`, 400);
            }

            // Pre-validation: Check if User already exists
            const existingUser = await this.userRepository.findByEmail(request.email);
            if (existingUser) {
                throw new AppError(`A user with the email ${request.email} already exists in the system.`, 409);
            }

            // Pre-validation: Check if Client already exists
            const slug = this.generateSlug(request.companyName);
            const exisitingClient = await this.clientRepository.findBySlug(slug);
            if (exisitingClient) {
                throw new AppError(`A client organization similar to '${request.companyName}' already exists.`, 409);
            }

            // 1. Create the Client
            const client = await this.createClient({
                name: request.companyName,
                email: request.email,
                description: request.useCase,
            }, adminUser);

            // 2. Generate random password
            const rawPassword = crypto.randomBytes(8).toString('hex');
            let username = request.email.split('@')[0] + Math.floor(Math.random() * 1000);
            
            // Ensure username uniqueness
            while (await this.userRepository.findByUsername(username)) {
                username = request.email.split('@')[0] + Math.floor(Math.random() * 1000);
            }

            // 3. Create the Client Admin user
            const user = await this.createClientUser(client._id, {
                username,
                email: request.email,
                password: rawPassword,
                role: APPLICATION_ROLES.CLIENT_ADMIN
            }, adminUser);

            // 4. Update request status
            request.status = "approved";
            await request.save();

            // 5. Send Email
            const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
            await emailService.sendWelcomeCredentials(request.email, username, rawPassword, `${frontendUrl}/login`);

            logger.info(`Access request approved for ${request.email}. Client and admin user created.`);
            
            return { client, user: this.formatClientForResponse(user) };
        } catch (error) {
            logger.error("Error approving access request:", error);
            throw error;
        }
    }

    async rejectAccessRequest(requestId, adminUser) {
        if (adminUser.role !== APPLICATION_ROLES.SUPER_ADMIN) {
            throw new AppError("Access denied - Super Admin only", 403);
        }

        const request = await AccessRequest.findById(requestId);
        if (!request) {
            throw new AppError("Access request not found", 404);
        }

        request.status = "rejected";
        await request.save();
        
        logger.info(`Access request rejected for ${request.email}`);
        return request;
    }

    async deleteUserCompletely(userId, adminUser) {
        if (adminUser.role !== APPLICATION_ROLES.SUPER_ADMIN) {
            throw new AppError("Access denied - Super Admin only", 403);
        }

        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new AppError("User not found", 404);
        }

        await this.userRepository.deleteById(userId);
        await AccessRequest.deleteMany({ email: user.email });

        logger.info(`User ${user.username} permanently deleted by ${adminUser.userId}`);
        return { success: true };
    }

    async deleteClientCompletely(clientId, adminUser) {
        if (adminUser.role !== APPLICATION_ROLES.SUPER_ADMIN) {
            throw new AppError("Access denied - Super Admin only", 403);
        }

        const client = await this.clientRepository.findById(clientId);
        if (!client) {
            throw new AppError("Client not found", 404);
        }

        // Cascade delete API keys
        await this.apiKeyRepository.deleteByClientId(clientId);
        
        // Cascade delete Users
        await this.userRepository.deleteByClientId(clientId);

        // Delete the Client
        await this.clientRepository.deleteById(clientId);

        // Delete any pending/approved AccessRequests associated with this client
        await AccessRequest.deleteMany({ email: client.email });

        logger.info(`Client ${client.name} and all associated data permanently deleted by ${adminUser.userId}`);
        return { success: true };
    }

    async deleteAccessRequest(requestId, adminUser) {
        if (adminUser.role !== APPLICATION_ROLES.SUPER_ADMIN) {
            throw new AppError("Access denied - Super Admin only", 403);
        }

        const request = await AccessRequest.findByIdAndDelete(requestId);
        if (!request) {
            throw new AppError("Access request not found", 404);
        }

        logger.info(`Access request permanently deleted for ${request.email}`);
        return { success: true };
    }
}