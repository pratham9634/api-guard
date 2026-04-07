
class BaseRepository {
    constructor(model){
        this.model = model;
    }

    async create(data){
        throw new Error("Method 'create' must be implemented.");
    }

    async findById(id){
        throw new Error("Method 'findById' must be implemented.");
    }

    async findByUsername(username){
        throw new Error("Method 'findByUsername' must be implemented.");
    }
    async findByEmail(email){
        throw new Error("Method 'findByEmail' must be implemented.");
    }

    async findAll(){
        throw new Error("Method 'findAll' must be implemented.");
    }
}

export default BaseRepository;