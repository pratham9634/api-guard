import ResponseFormatter from "../../../shared/utils/responseFormatter.js"

/**
 * ClientController class to handle client related requests
 */
export class ClientController {
    /**
     * Constructor for ClientController
     * @param {Object} clientService 
     * @param {Object} authService 
     */
    constructor(clientService, authService) {
        // Validate dependencies
        if (!clientService) {
            throw new Error('ClientService is required');
        };

        if (!authService) {
            throw new Error('authService is required');
        };

        // Assign dependencies to instance variables
        this.clientService = clientService;
        this.authService = authService;
    };


    /**
     * Create a new client, only accessible by super admins
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     * @param {Function} next - Express next function for error handling
     * @returns {Promise<Response>} - JSON response with created client data or error message
     */
    async createClient(req, res, next) {
        try {
            const isSuperAdmin = await this.authService.checkSuperAdminPermissions(req.user.userId);
            if (!isSuperAdmin) {
                return res.status(403).json(ResponseFormatter.error("Access denied", 403))
            };

            const client = await this.clientService.createClient(req.body, req.user);

            return res.status(201).json(ResponseFormatter.success(client, "Client created successfully", 201))
        } catch (error) {
            next(error)
        }
    }

    /**
     * Create a new client user for a specific client
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     * @param {Function} next - Express next function for error handling
     * @returns {Promise<Response>} - JSON response with created client user data or error message
     */
    async createClientUser(req, res, next) {
        try {
            const { clientId } = req.params;
            const user = await this.clientService.createClientUser(clientId, req.body, req.user)
            return res.status(201).json(ResponseFormatter.success(user, "Client user created successfully", 201))
        } catch (error) {
            next(error)
        }
    }


    /**
     * Create a new API key for a specific client
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     * @param {Function} next - Express next function for error handling
     * @returns {Promise<Response>} - JSON response with created API key data or error message
     */
    async createApiKey(req, res, next) {
        try {
            const { clientId } = req.params;
            const apiKey = await this.clientService.createApiKey(clientId, req.body, req.user)
            return res.status(201).json(ResponseFormatter.success(apiKey, "API key created successfully", 201))
        } catch (error) {
            next(error)
        }
    };

    /**
     * Get all API keys for a specific client
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     * @param {Function} next - Express next function for error handling
     * @returns {Promise<Response>} - JSON response with fetched API keys data or error message
 */
    async getClientApiKeys(req, res, next) {
        try {
            const { clientId } = req.params;
            const apiKey = await this.clientService.getClientApiKeys(clientId, req.user)
            return res.status(200).json(ResponseFormatter.success(apiKey, "API key fetched successfully", 200))
        } catch (error) {
            next(error)
        }
    }


        /**
     * Get all clients (super_admin) or own client (client users)
     */
    async getClients(req, res, next) {
        try {
            const clients = await this.clientService.getClients(req.user);
            return res.status(200).json(ResponseFormatter.success(clients, "Clients fetched successfully", 200));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get single client details
     */
    async getClientById(req, res, next) {
        try {
            const { clientId } = req.params;
            const client = await this.clientService.getClientById(clientId, req.user);
            return res.status(200).json(ResponseFormatter.success(client, "Client details fetched successfully", 200));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update client (name, description, settings, website, email)
     */
    async updateClient(req, res, next) {
        try {
            const { clientId } = req.params;
            const updatedClient = await this.clientService.updateClient(clientId, req.body, req.user);
            return res.status(200).json(ResponseFormatter.success(updatedClient, "Client updated successfully", 200));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Deactivate client (soft delete)
     */
    async deactivateClient(req, res, next) {
        try {
            const { clientId } = req.params;
            const deactivatedClient = await this.clientService.deactivateClient(clientId, req.user);
            return res.status(200).json(ResponseFormatter.success(deactivatedClient, "Client deactivated successfully", 200));
        } catch (error) {
            next(error);
        }
    }

    /**
     * List users for a client
     */
    async getClientUsers(req, res, next) {
        try {
            const { clientId } = req.params;
            const users = await this.clientService.getClientUsers(clientId, req.user);
            return res.status(200).json(ResponseFormatter.success(users, "Client users fetched successfully", 200));
        } catch (error) {
            next(error);
        }
    }

        /**
     * Revoke / deactivate an API key
     */
    async revokeApiKey(req, res, next) {
        try {
            const { clientId, keyId } = req.params;
            const updatedKey = await this.clientService.revokeApiKey(clientId, keyId, req.user);
            return res.status(200).json(ResponseFormatter.success(updatedKey, "API key revoked successfully", 200));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Rotate an API key
     */
    async rotateApiKey(req, res, next) {
        try {
            const { clientId, keyId } = req.params;
            const rotatedKey = await this.clientService.rotateApiKey(clientId, keyId, req.user);
            return res.status(200).json(ResponseFormatter.success(rotatedKey, "API key rotated successfully", 200));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete an API key
     */
    async deleteApiKey(req, res, next) {
        try {
            const { clientId, keyId } = req.params;
            await this.clientService.deleteApiKey(clientId, keyId, req.user);
            return res.status(200).json(ResponseFormatter.success(null, "API key deleted successfully", 200));
        } catch (error) {
            next(error);
        }
    }

        /**
     * List all users (super_admin only)
     */
    async getAllUsers(req, res, next) {
        try {
            const users = await this.authService.getAllUsers(req.user);
            return res.status(200).json(ResponseFormatter.success(users, "All users fetched successfully", 200));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Activate/deactivate user
     */
    async updateUserStatus(req, res, next) {
        try {
            const { userId } = req.params;
            const { isActive } = req.body;
            const updatedUser = await this.authService.updateUserStatus(userId, isActive, req.user);
            return res.status(200).json(ResponseFormatter.success(updatedUser, "User status updated successfully", 200));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Change user role
     */
    async updateUserRole(req, res, next) {
        try {
            const { userId } = req.params;
            const { role } = req.body;
            const updatedUser = await this.authService.updateUserRole(userId, role, req.user);
            return res.status(200).json(ResponseFormatter.success(updatedUser, "User role updated successfully", 200));
        } catch (error) {
            next(error);
        }
    }


}