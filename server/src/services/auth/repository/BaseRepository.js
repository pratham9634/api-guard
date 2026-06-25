
/**
 * @file BaseRepository.js
 * @description Abstract base repository defining query and write signatures.
 * Must be extended by database-specific implementations (e.g., MongoDB, SQL).
 */

class BaseRepository {
    /**
     * @param {any} model - Database model instance (e.g., Mongoose model).
     */
    constructor(model){
        this.model = model;
    }

    /**
     * Abstract create signature.
     * @param {Object} data - Input payload.
     * @throws {Error} Method must be implemented.
     */
    async create(data){
        throw new Error("Method 'create' must be implemented.");
    }

    /**
     * Abstract findById signature.
     * @param {string|number} id - Record identifier.
     * @throws {Error} Method must be implemented.
     */
    async findById(id){
        throw new Error("Method 'findById' must be implemented.");
    }

    /**
     * Abstract findByUsername signature.
     * @param {string} username - User account name.
     * @throws {Error} Method must be implemented.
     */
    async findByUsername(username){
        throw new Error("Method 'findByUsername' must be implemented.");
    }

    /**
     * Abstract findByEmail signature.
     * @param {string} email - Email address identifier.
     * @throws {Error} Method must be implemented.
     */
    async findByEmail(email){
        throw new Error("Method 'findByEmail' must be implemented.");
    }

    /**
     * Abstract findAll signature.
     * @throws {Error} Method must be implemented.
     */
    async findAll(){
        throw new Error("Method 'findAll' must be implemented.");
    }
}

export default BaseRepository;