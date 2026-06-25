/**
 * @file clientRoutes.js
 * @description Registers client and API Key management endpoints.
 * Integrates tenant lookup permissions and superAdmin administration overrides.
 */

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

// Hard delete client
router.delete("/admin/clients/:clientId/hard", (req, res, next) => clientController.deleteClientCompletely(req, res, next))

// List users for a client
router.get("/admin/clients/:clientId/users", (req, res, next) => clientController.getClientUsers(req, res, next))

// Revoke API key for a client
router.put("/admin/clients/:clientId/api/keys/:keyId/revoke", (req, res, next) => clientController.revokeApiKey(req, res, next))

// Rotate API key for a client
router.put("/admin/clients/:clientId/api/keys/:keyId/rotate", (req, res, next) => clientController.rotateApiKey(req, res, next))

// Delete API key for a client
router.delete("/admin/clients/:clientId/api/keys/:keyId", (req, res, next) => clientController.deleteApiKey(req, res, next))

// --- Access Requests ---

router.get("/admin/requests", (req, res, next) => clientController.getAccessRequests(req, res, next));
router.post("/admin/requests/:requestId/approve", (req, res, next) => clientController.approveAccessRequest(req, res, next));
router.post("/admin/requests/:requestId/reject", (req, res, next) => clientController.rejectAccessRequest(req, res, next));
router.delete("/admin/requests/:requestId", (req, res, next) => clientController.deleteAccessRequest(req, res, next));


// List all users (super_admin only)
router.get("/admin/users", (req, res, next) => clientController.getAllUsers(req, res, next))

// Activate/deactivate user (super_admin only)
router.put("/admin/users/:userId/status", (req, res, next) => clientController.updateUserStatus(req, res, next))

// Change user role (super_admin only)
router.put("/admin/users/:userId/role", (req, res, next) => clientController.updateUserRole(req, res, next))

// Hard delete user (super_admin only)
router.delete("/admin/users/:userId", (req, res, next) => clientController.deleteUser(req, res, next))

export default router;