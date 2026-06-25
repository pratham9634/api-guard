

/**
 * @file BaseApiKeyRepository.js
 * @description Abstract base repository for API Key storage transactions.
 * Outlines required methods for CRUD operations on client API keys.
 */

export default class BaseApiKeyRepository {
    /**
     * @param {any} model - Database model instance.
     */
    constructor(model) {
        this.model = model;
    }

    /**
     * Abstract create signature.
     * @param {Object} apiKeyData - Input payload.
     */
    async create(apiKeyData) {
        throw new Error('Method not implemented');
    }

    /**
     * Abstract findByKeyValue signature.
     * @param {string} keyValue - Raw value of API key.
     * @param {boolean} includeInactive - Include deactivated keys.
     */
    async findByKeyValue(keyValue, includeInactive) {
        throw new Error('Method not implemented');
    }

    /**
     * Abstract findByClientId signature.
     * @param {string} clientId - Client organization reference.
     * @param {Object} filters - Search filters.
     */
    async findByClientId(clientId, filters) {
        throw new Error('Method not implemented');
    }

    /**
     * Abstract countByClientId signature.
     * @param {string} clientId - Client reference.
     * @param {Object} filters - Search filters.
     */
    async countByClientId(clientId, filters) {
        throw new Error('Method not implemented');
    }

    /**
     * Abstract findByKeyId signature.
     * @param {string} keyId - API Key UUID.
     */
    async findByKeyId(keyId) {
        throw new Error('Method not implemented');
    }

    /**
     * Abstract update signature.
     * @param {string} keyId - Key UUID to update.
     * @param {Object} updateData - Modifying properties.
     */
    async update(keyId, updateData) {
        throw new Error('Method not implemented');
    }

    /**
     * Abstract delete signature.
     * @param {string} keyId - Key UUID to delete.
     */
    async delete(keyId) {
        throw new Error('Method not implemented');
    }

}
