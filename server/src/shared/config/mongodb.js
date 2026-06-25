/**
 * @file mongodb.js
 * @description Manages the singleton connection instance for MongoDB using Mongoose.
 * Handles auto-reconnect listeners, logs disconnection states, and gracefully disconnects when shutdown.
 */

import mongoose from "mongoose";
import config from "./index.js";
import logger from "./logger.js";

/**
 * MongoConnection class providing connect, disconnect, and getter methods.
 */
class MongoConnection {
    constructor(){
        /**
         * Cached reference of the active mongoose connection.
         * @type {mongoose.Connection|null}
         */
        this.connection = null;
    }

    /**
     * Establishes a connection to MongoDB using credentials/options from global config.
     * Caches the connection reference. Adds event listeners for connection errors and disconnects.
     * @returns {Promise<mongoose.Connection>}
     */
    async connect(){
        try{
            // Reuse connection if already established
            if(this.connection){
                logger.info("Mongodb already connected")
                return this.connection;
            }
        
            await mongoose.connect(config.mongo.mongo_url,{
                dbName: config.mongo.mongo_db_name,
            }) 

            this.connection = mongoose.connection;

            logger.info("Mongodb connected successfully");

            // Handle connection error events after initial connection
            this.connection.on("error",(error)=>{
                logger.error("Mongodb connection error",error);
                throw new Error("Failed to connect to MongoDB");
            })

            // Log if MongoDB disconnected from the driver
            this.connection.on("disconnected",()=>{
                logger.info("Mongodb disconnected");
            })  
            return this.connection;

        }catch(error){
            logger.error("Mongodb connection failure due to some reason", error);
            throw new Error("Failed to connect to MongoDB");
        }
    }

    /**
     * Disconnects the Mongoose connection cleanly. Resets local cached connection.
     * @returns {Promise<void>}
     */
    async disconnect(){
        try{
            if(this.connection){
                await mongoose.disconnect();
                this.connection = null;
                logger.info("Mongodb disconnected successfully");
            }
        }catch(error){
            logger.error("Mongodb disconnection failure due to some reason", error);
            throw new Error("Failed to disconnect from MongoDB");
        }
    }

    /**
     * Retrieves the cached Mongoose connection object.
     * @returns {mongoose.Connection|null}
     */
    getconnection(){
        return this.connection;
    }
}
export default new MongoConnection();

