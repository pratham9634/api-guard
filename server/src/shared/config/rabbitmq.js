import amqp from "amqplib";
import config from "./index.js";
import logger from "./logger.js";

class RabbitMqConnection{
    constructor(){
        this.connection = null;
        this.channel = null;
        this.isConnecting = null;
    }

    async connect(){
        if(this.channel){
            return this.channel;
        }

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

            const dlqName = `${config.rabbitmq.queue}.dlq`;
            await this.channel.assertQueue(dlqName,{durable:true});

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

    getChannel(){
        if(!this.channel){
            throw new Error("RabbitMQ not connected");
        }
        return this.channel;
    }

    getStatus() {
    if (!this.connection || !this.channel) return "disconnected";
    if (this.connection?.closing) return "closing";
    return "connected";
}

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