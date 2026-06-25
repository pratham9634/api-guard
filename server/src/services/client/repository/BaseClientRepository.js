
/**
 * @file BaseClientRepository.js
 * @description Abstract base repository for Client tenant storage transactions.
 * Outlines required interfaces for client CRUD operations.
 */

export default class BaseClientRepository {
    /**
     * @param {any} model - Database model instance.
     */
    constructor(model) {
        this.model = model
    };

    /**
     * Abstract create signature.
     * @param {Object} clientData - Client fields.
     */
    async create(clientData) {
        throw new Error("Method not implemented")
    };

    /**
     * Abstract findById signature.
     * @param {string} clientId - Client ID.
     */
    async findById(clientId) {
        throw new Error('Method not implemented');
    }

    /**
     * Abstract findBySlug signature.
     * @param {string} slug - Unique identifier url string.
     */
    async findBySlug(slug) {
        throw new Error('Method not implemented');
    }

    /**
     * Abstract find signature.
     * @param {Object} filters - Search filters.
     * @param {Object} options - Pagination/sorting parameters.
     */
    async find(filters, options) {
        throw new Error('Method not implemented');
    }

    /**
     * Abstract count signature.
     * @param {Object} filters - Search filters.
     */
    async count(filters) {
        throw new Error('Method not implemented');
    }

    /**
     * Abstract update signature.
     * @param {string} clientId - Client identifier.
     * @param {Object} updateData - Modifying properties.
     */
    async update(clientId,updateData){
        throw new Error("Method not implemented")
    }
}