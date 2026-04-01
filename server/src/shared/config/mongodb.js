import mongoose from "mongoose";
import config from "./config.js";
import logger from "./logger.js";

class MongoConnection {
    constructor(){
        this.connection = null;
    }

    async connect(){
        try{
            if(this.connection){
                logger.info("Mongodb already connected")
                return this.connection;
            }
        
            await mongoose.connect(config.mongo.mongo_url,{
                dbName: config.mongo.mongo_db_name,
                useNewUrlParser: true,
                useUnifiedTopology: true,
            }) 

            this.connection = mongoose.connection;

            logger.info("Mongodb connected successfully");
            this.connection.on("error",(error)=>{
                logger.error("Mongodb connection error",error);
                throw new Error("Failed to connect to MongoDB");
            })
            this.connection.on("disconnected",()=>{
                logger.info("Mongodb disconnected");
            })  
            return this.connection;

        }catch(error){
            logger.error("Mongodb connection fali due to some reason", error);
            throw new Error("Failed to connect to MongoDB");
        }
    }

    async disconnect(){
        try{
            if(this.connection){
                await mongoose.disconnect();
                this.connection = null;
                logger.info("Mongodb disconnected successfully");
            }
        }catch(error){
            logger.error("Mongodb disconnection fali due to some reason", error);
            throw new Error("Failed to disconnect from MongoDB");
        }
    }
    getconnection(){
        return this.connection;
    }
}
export default new MongoConnection();

