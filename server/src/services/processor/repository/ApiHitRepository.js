/**
 * @file ApiHitRepository.js
 * @description Mongoose database access implementation for raw API hit events.
 * Extends BaseRepository to perform writes, query lookups, and TTL purge deletions on MongoDB.
 */

import { BaseRepository } from "./BaseRepository.js";

/**
 * Repository class implementing MongoDB database storage operations for raw API hits.
 */
export class ApiHitRepository extends BaseRepository{
    /**
     * @param {Object} dependencies
     * @param {import('mongoose').Model} dependencies.model - Mongoose schema model for API hits.
     * @param {Object} [dependencies.logger] - Logger instance.
     */
    constructor({model,logger :l = console}={}){
        super({logger :l});
        if(!model){
            throw new Error('ApiHitRepository required mongoose model');
        }
        this.model = model;
    }

    /**
     * Saves a parsed API hit document to MongoDB.
     * Gracefully handles duplicate keys (MongoDB error code 11000) for idempotency.
     * 
     * @param {Object} eventData - Validated API hit properties.
     * @returns {Promise<Object|null>} The stored Mongoose document or null if duplicate.
     */
    async save(eventData){
        try {
            const doc = new this.model(eventData);
            await doc.save();
            this.logger.info("API hit saved to MongoDB", { eventId: eventData.eventId })
            return doc;
        } catch (error) {
            // E11000 indicates a duplicate key violation in MongoDB (e.g. eventId unique constraint)
            if (error && error.code === 11000) {
                this.logger.warn('Duplicate event ID, skipping save', { eventId: eventData.eventId });
                return null;
            }
            this.logger.error('Error saving api hit data:',error);
            throw error;
        }
    }

    /**
     * Finds API hits matching filter parameters.
     * 
     * @param {Object} [filter] - Mongo filter options.
     * @param {Object} [options] - Query options (limit, skip, sort).
     * @returns {Promise<Array<Object>>} Resolved array of lean documents.
     */
    async find(filter={},options={}){
        try{
            const { limit = 100, skip = 0, sort = { timestamp: -1 } } = options;
            const hits = await this.model.find(filter).sort(sort).limit(limit).skip(skip).lean();

            return hits;
        } catch(error){
            this.logger.error('Error finding API hits:', error);
            throw error;
        }
    }

    /**
     * Returns total count of documents matching the filter.
     * 
     * @param {Object} [filters] - MongoDB filters structure.
     * @returns {Promise<number>} Total records count.
     */
    async count(filters = {}) {
        try {
            const count = await this.model.countDocuments(filters);
            return count;
        } catch (error) {
            this.logger.error('Error counting API hits:', error);
            throw error;
        }
    }

    /**
     * Deletes historical API hit documents created prior to a specified date boundary.
     * 
     * @param {Date} beforeDate - Date boundary for removal.
     * @returns {Promise<number>} Count of deleted raw logs.
     */
    async deleteOldHits(beforeDate) {
        try {
            const result = await this.model.deleteMany({ timestamp: { $lt: beforeDate } });
            this.logger.info('Deleted old API hits', { count: result.deletedCount });
            return result.deletedCount;
        } catch (error) {
            this.logger.error('Error deleting old API hits:', error);
            throw error;
        }
    }

}