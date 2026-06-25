/**
 * @file rabbitmq.js
 * @description Establishes and manages a connection/channel to RabbitMQ.
 * Sets up the dead-letter queue (DLQ) and routing arguments to ensure failed messages are redirected.
 * Uses a concurrency-blocking mechanism (isConnecting flag) to prevent duplicate connection attempts.
 */

import amqp from "amqplib";
import config from "./index.js";
import logger from "./logger.js";

/**
 * Singleton helper for RabbitMQ connection/channel operations.
 */
class RabbitMqConnection{
    constructor(){
        /** @type {amqp.Connection|null} */
        this.connection = null;
        /** @type {amqp.Channel|null} */
        this.channel = null;
        /** 
         * Flag to track if a connection process is currently active.
         * @type {boolean|null} 
         */
        this.isConnecting = null;
    }

    /**
     * Connects to RabbitMQ host, creates a channel, asserts the DLQ queue,
     * and asserts the main queue configured with DLQ attributes.
     * Implements logic to wait if another connection attempt is active.
     * @returns {Promise<amqp.Channel>} The open amqp channel.
     */
    async connect(){
        // If channel is already open, return it immediately
        if(this.channel){
            return this.channel;
        }

        // If another request is currently connecting, poll until it succeeds to avoid overlapping connections
        if(this.isConnecting){
            await new Promise((resolve)=>{
                const interval = setInterval(()=>{
                    if(this.channel){
                        clearInterval(interval);
                        resolve();
                    }
                },100);
            })
            return this.channel;
        }

        try{
            this.isConnecting = true;

            logger.info(`Connecting to RabbitMQ at ${config.rabbitmq.url}`);
            this.connection = await amqp.connect(config.rabbitmq.url)
            this.channel = await this.connection.createChannel();

            // Set up Dead Letter Queue (DLQ) for failed message handling
            const dlqName = `${config.rabbitmq.queue}.dlq`;
            await this.channel.assertQueue(dlqName,{durable:true});

            // Configure the main queue with references to the DLQ.
            // If a message is rejected or nacked on this queue, it gets automatically routed to the DLQ.
            const queueOptions = {
                durable:true,
                arguments:{
                    "x-dead-letter-exchange": "",
                    "x-dead-letter-routing-key": dlqName,
                }
            }

            await this.channel.assertQueue(config.rabbitmq.queue,queueOptions);
            logger.info(`Queue ${config.rabbitmq.queue} and DLQ ${dlqName} asserted`);
            logger.info("RabbitMQ connected successfully");

            // Attach listeners to reset connections on closing or error events
             this.connection.on("close", () => {
                logger.warn('RabbitMQ connection closed');
                this.connection = null;
                this.channel = null;
            })

            this.connection.on("error", (err) => {
                logger.error('RabbitMQ connection err', err);
                this.connection = null;
                this.channel = null;
            })
            
            this.isConnecting = false;
            return this.channel;
        }
        catch(error){
            logger.error("Failed to connect to RabbitMQ",error);
            this.isConnecting = false;
            throw error;
        }
        
    }

    /**
     * Synchronously returns the cached channel if it exists, otherwise throws an error.
     * @returns {amqp.Channel}
     */
    getChannel(){
        if(!this.channel){
            throw new Error("RabbitMQ not connected");
        }
        return this.channel;
    }

    /**
     * Gets the connection status as a string.
     * @returns {"connected"|"closing"|"disconnected"}
     */
    getStatus() {
        if (!this.connection || !this.channel) return "disconnected";
        if (this.connection?.closing) return "closing";
        return "connected";
    }

    /**
     * Gracefully closes the channel and the connection.
     */
    async close(){
        try{
            if(this.channel){
                await this.channel.close();
                this.channel = null;
            }
            if(this.connection){
                await this.connection.close();
                this.connection = null;
            }
            logger.info("RabbitMQ connection closed");
        }
        catch(error){
            logger.error("Failed to close RabbitMQ connection",error);
        }
    }
}
export default new RabbitMqConnection();