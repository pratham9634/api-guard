/**
 * @file ApiKeyRepository.js
 * @description Mongoose implementation of BaseApiKeyRepository.
 * Manages CRUD operations for API keys including key activation toggles, rotations, and client cascades.
 */

import logger from "../../../shared/config/logger.js";
import ApiKey from "../../../shared/models/ApiKey.js"
import BaseApiKeyRepository from "./BaseApiKeyRepository.js"

/**
 * Mongo-specific implementation of the API Key Repository.
 * @extends BaseApiKeyRepository
 */
class MongoApiKeyRepository extends BaseApiKeyRepository {
    constructor(){
        super(ApiKey);
    }

    /**
     * Inserts a new API Key document.
     * @param {Object} apiKeyData - Input parameters.
     * @returns {Promise<ApiKey>}
     */
    async create(apiKeyData){
        try{
            const apiKey = this.model(apiKeyData);
            await apiKey.save();
            logger.info(`API Key created successfully: ${apiKey._id}`);
            return apiKey;
        }
        catch(error){
            logger.error(`Error creating API Key: ${error.message}`);
            throw error;
        }
    }

    /**
     * Looks up API key matching hashed value. Populates associated client profile.
     * @param {string} keyValue - API key string.
     * @param {boolean} [includeInactive=false] - If true, ignores isActive filter constraint.
     * @returns {Promise<ApiKey|null>}
     */
     async findByKeyValue(keyValue, includeInactive = false) {
        try {
            const filter = { keyValue };
            if (!includeInactive) {
                filter.isActive = true;
            }

            const apiKey = await this.model.findOne(filter).populate('clientId');
            return apiKey;
        } catch (error) {
            logger.error('Error finding API key by value:', error);
            throw error;
        }
    }

    /**
     * Queries API keys belonging to a client organization. Sorts newest first.
     * @param {string} clientId - Client organization reference.
     * @param {Object} [filters={}] - Optional query fields.
     * @returns {Promise<ApiKey[]>}
     */
    async findByClientId(clientId, filters = {}) {
        try {
            const query = { clientId, ...filters };
            const apiKeys = await this.model.find(query)
                .populate('createdBy', 'username email')
                .sort({ createdAt: -1 });

            return apiKeys;
        } catch (error) {
            logger.error('Error finding API keys by client ID:', error);
            throw error;
        }
    }

    /**
     * Counts API key records tied to a client organization.
     * @param {string} clientId - Client organization selector.
     * @param {Object} [filters={}] - Query fields.
     * @returns {Promise<number>}
     */
    async countByClientId(clientId, filters = {}) {
        try {
            const query = { clientId, ...filters };
            const count = await this.model.countDocuments(query);
            return count;
        } catch (error) {
            logger.error('Error counting API keys:', error);
            throw error;
        }
    }

    /**
     * Looks up API key by key UUID. Populates associated client details.
     * @param {string} keyId - Key UUID.
     * @returns {Promise<ApiKey|null>}
     */
    async findByKeyId(keyId) {
        try {
            const apiKey = await this.model.findOne({ keyId }).populate('clientId');
            return apiKey;
        } catch (error) {
            logger.error('Error finding API key by keyId:', error);
            throw error;
        }
    }

    /**
     * Updates an existing API key document.
     * @param {string} keyId - Key UUID.
     * @param {Object} updateData - Modified attributes.
     * @returns {Promise<ApiKey|null>} Updated key model.
     */
    async update(keyId, updateData) {
        try {
            const apiKey = await this.model.findOneAndUpdate(
                { keyId },
                { $set: updateData },
                { new: true, runValidators: true }
            );
            logger.info(`API Key updated successfully: ${keyId}`);
            return apiKey;
        } catch (error) {
            logger.error(`Error updating API Key: ${error.message}`);
            throw error;
        }
    }

    /**
     * Deletes a single API key document matching key UUID.
     * @param {string} keyId - Key UUID.
     * @returns {Promise<boolean>} True if document deleted.
     */
    async delete(keyId) {
        try {
            const result = await this.model.deleteOne({ keyId });
            logger.info(`API Key deleted successfully: ${keyId}`);
            return result.deletedCount > 0;
        } catch (error) {
            logger.error(`Error deleting API Key: ${error.message}`);
            throw error;
        }
    }

    /**
     * Deletes all API key documents matching client ID.
     * @param {string} clientId - Client organization reference.
     * @returns {Promise<number>} Count of deleted items.
     */
    async deleteByClientId(clientId) {
        try {
            const result = await this.model.deleteMany({ clientId });
            logger.info(`API Keys deleted for client: ${clientId}`);
            return result.deletedCount;
        } catch (error) {
            logger.error(`Error deleting API Keys for client: ${error.message}`);
            throw error;
        }
    }

}
export default new MongoApiKeyRepository();