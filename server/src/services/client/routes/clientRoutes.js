import express from "express";
import clientDependencies from "../Dependencies/dependencies.js"
import authenticate from "../../../shared/middlewares/authenticate.js"

// Create a new router instance
const router = express.Router();

// Destructure the clientController from the dependencies
const { clientController } = clientDependencies.controller

// Apply authentication middleware to all routes in this router
router.use(authenticate);

// Onboard a new client
router.post("/admin/clients/onboard", (req, res, next) => clientController.createClient(req, res, next))

// Create a user for a client
router.post("/admin/clients/:clientId/users", (req, res, next) => clientController.createClientUser(req, res, next))

// Create API key for a client
router.post("/admin/clients/:clientId/api/keys", (req, res, next) => clientController.createApiKey(req, res, next))

// Get all API keys for a client
router.get("/admin/clients/:clientId/api/keys", (req, res, next) => clientController.getClientApiKeys(req, res, next))

// List all clients (super_admin) / own client (client users)
router.get("/admin/clients", (req, res, next) => clientController.getClients(req, res, next))

// Get single client details
router.get("/admin/clients/:clientId", (req, res, next) => clientController.getClientById(req, res, next))

// Update client (name, description, settings)
router.put("/admin/clients/:clientId", (req, res, next) => clientController.updateClient(req, res, next))

// Deactivate client (soft delete)
router.delete("/admin/clients/:clientId", (req, res, next) => clientController.deactivateClient(req, res, next))

// List users for a client
router.get("/admin/clients/:clientId/users", (req, res, next) => clientController.getClientUsers(req, res, next))

// Revoke API key for a client
router.put("/admin/clients/:clientId/api/keys/:keyId/revoke", (req, res, next) => clientController.revokeApiKey(req, res, next))

// Rotate API key for a client
router.put("/admin/clients/:clientId/api/keys/:keyId/rotate", (req, res, next) => clientController.rotateApiKey(req, res, next))

// Delete API key for a client
router.delete("/admin/clients/:clientId/api/keys/:keyId", (req, res, next) => clientController.deleteApiKey(req, res, next))


// List all users (super_admin only)
router.get("/admin/users", (req, res, next) => clientController.getAllUsers(req, res, next))

// Activate/deactivate user (super_admin only)
router.put("/admin/users/:userId/status", (req, res, next) => clientController.updateUserStatus(req, res, next))

// Change user role (super_admin only)
router.put("/admin/users/:userId/role", (req, res, next) => clientController.updateUserRole(req, res, next))

export default router;