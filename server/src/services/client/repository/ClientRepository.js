/**
 * @file ClientRepository.js
 * @description Mongoose implementation of BaseClientRepository.
 * Handles database operations for Client documents including lookup by slug, paginated indexes, and updates.
 */

import BaseClientRepository from "./BaseClientRepository.js";
import Client from "../../../shared/models/Client.js";
import logger from "../../../shared/config/logger.js"

/**
 * MongoDB repository subclass for Client collections.
 * @extends BaseClientRepository
 */
class MongoClientRepository extends BaseClientRepository {
    constructor() {
        super(Client)
    }

    /**
     * Creates and saves a new client company tenant entry.
     * @param {Object} clientData - Client variables.
     * @returns {Promise<Client>} Saved Mongoose Client model.
     */
    async create(clientData) {
        try {
            const client = new this.model(clientData);
            await client.save();

            logger.info('Client created in MongoDB', {
                mongoId: client._id,
                slug: client.slug
            });

            return client;
        } catch (error) {
            logger.error('Error creating client in db', error);
            throw error
        }
    }

    /**
     * Looks up client by ObjectId.
     * @param {string} clientId - Client primary key.
     * @returns {Promise<Client|null>}
     */
    async findById(clientId) {
        try {
            const client = await this.model.findById(clientId);

            logger.info('Client details from MongoDB', client);

            return client
        } catch (error) {
            logger.error('Error finding client in db by id', error);
            throw error
        }
    };

    /**
     * Looks up client matching slug.
     * @param {string} slug - slug parameter.
     * @returns {Promise<Client|null>}
     */
    async findBySlug(slug) {
        try {
            const client = await this.model.findOne({ slug });
            return client;
        } catch (error) {
            logger.error('Error finding client by slug:', error);
            throw error;
        }
    }

    /**
     * Queries clients with page, skip, limit, and sort configurations.
     * @param {Object} [filters={}] - Query match selectors.
     * @param {Object} [options={}] - Pagination and sorting variables.
     * @param {number} [options.limit=50] - Return array ceiling.
     * @param {number} [options.skip=0] - Offset index.
     * @param {Object} [options.sort={createdAt: -1}] - Sort directions.
     * @returns {Promise<Client[]>}
     */
    async find(filters = {}, options = {}) {
        try {
            const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;

            const clients = await this.model.find(filters)
                 .sort(sort)
                 .skip(skip)
                 .limit(limit)
                 .select('-__v');

            return clients;
        } catch (error) {
            logger.error('Error finding clients:', error);
            throw error;
        }
    }

    /**
     * Counts documents matching filters.
     * @param {Object} [filters={}] - Matching criteria.
     * @returns {Promise<number>}
     */
    async count(filters = {}) {
        try {
            const count = await this.model.countDocuments(filters);
            return count;
        } catch (error) {
            logger.error('Error counting clients:', error);
            throw error;
        }
    }

    /**
     * Updates an existing Client document.
     * @param {string} clientId - Client reference.
     * @param {Object} updateData - Modified settings.
     * @returns {Promise<Client|null>} Updated model.
     */
    async update(clientId,updateData){
        try {
            const updatedClient = await this.model.findByIdAndUpdate(
                clientId,
                { $set: updateData },
                { new: true, runValidators: true }
            );

            logger.info('Client updated in MongoDB', {
                mongoId: updatedClient._id,
                name: updatedClient.name,
                updatedAt: updatedClient.updatedAt
            });

            return updatedClient;
        } catch (error) {
            logger.error('Error updating client in MongoDB', error);
            throw error;
        }
    }

    /**
     * Hard deletes client document.
     * @param {string} clientId - Client reference to purge.
     */
    async deleteById(clientId) {
        try {
            await this.model.findByIdAndDelete(clientId);
            logger.info('Client permanently deleted from MongoDB', { clientId });
        } catch (error) {
            logger.error('Error deleting client from MongoDB', error);
            throw error;
        }
    }
}


export default new MongoClientRepository()