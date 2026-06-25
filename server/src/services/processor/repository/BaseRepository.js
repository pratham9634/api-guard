
/**
 * @file BaseRepository.js
 * @description Abstract base repository class defining the database access contract for processor repository implementations.
 */

/**
 * Base interface / contract class for all database repositories.
 */
export class BaseRepository {
    /**
     * @param {Object} [dependencies]
     * @param {Object} [dependencies.logger] - Logger implementation (defaults to console).
     */
    constructor({logger :l = console}={}){
        this.logger = l;
    }

    /**
     * Persists a record. Must be implemented by child classes.
     * @throws {Error} If method is not overridden.
     */
    async save() {
        throw new Error('Method not implemented: save');
    }

    /**
     * Retrieves records. Must be implemented by child classes.
     * @throws {Error} If method is not overridden.
     */
    async find() {
        throw new Error('Method not implemented: find');
    }

    /**
     * Counts documents. Must be implemented by child classes.
     * @throws {Error} If method is not overridden.
     */
    async count() {
        throw new Error('Method not implemented: count');
    }

    /**
     * Deletes records matching retention criteria. Must be implemented by child classes.
     * @throws {Error} If method is not overridden.
     */
    async deleteOldHits() {
        throw new Error('Method not implemented: deleteOldHits');
    }
}