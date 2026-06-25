/**
 * @file ConfirmChannelManager.js
 * @description Manages a RabbitMQ confirmation channel.
 * Implements publisher confirms for high reliability, and queues duplicate simultaneous requests
 * while the channel is being initially constructed.
 */

import {EventEmitter} from "node:events";

/**
 * Manages the lifecycle of a RabbitMQ confirmation channel.
 * Extends Node's EventEmitter to propagate channel close and error conditions.
 * @extends EventEmitter
 */
export class ConfirmChannelManager extends EventEmitter{

    /**
     * @param {Object} dependencies - Dependent modules.
     * @param {Object} dependencies.rabbitmq - Connection manager.
     * @param {Object} [dependencies.logger=console] - Logger utility.
     */
    constructor({rabbitmq,logger}){
        super();

        if (!rabbitmq) throw new Error("Confirm Channel Manager requires rabbitmq connection manager");

        this._rabbitmq = rabbitmq;
        this._logger = logger ?? console;
        this._channel = null;
        this._connecting = false;
        
        /**
         * Waiters queue holding resolve/reject callbacks for concurrent requests during channel setup.
         * @type {Array<{resolve: Function, reject: Function}>}
         */
        this._connectWaiters = [];
    }

    /**
     * Returns the active amqplib ConfirmChannel.
     * If not connected, starts connection. If already connecting, queues resolve handler.
     * @returns {Promise<import('amqplib').ConfirmChannel>}
     */
    async getChannel(){
        if(this._channel){
            return this._channel;
        }

        // If connection is in-flight, return a promise and store resolver callbacks
        if(this._connecting){
            return new Promise((resolve,reject)=>{
                this._connectWaiters.push({resolve,reject});
            })
        }
        return this._connect();
    }

    /**
     * Creates a connection channel, registers events, and resolves queue waiters.
     * @private
     * @returns {Promise<import('amqplib').ConfirmChannel>}
     */
    async _connect(){
        this._connecting = true;
        try{
            let connection;

            // Reuse connection or establish a new one
            if(this._rabbitmq.connection){
                connection = this._rabbitmq.connection;
            }else{
                await this._rabbitmq.connect();

                if (!this._rabbitmq.connection) {
                    throw new Error('Failed to obtain RabbitMQ connection');
                };

                connection = this._rabbitmq.connection;
            }

            // Create confirm channel (waits for broker acknowledgements)
            const confirmChannel = await connection.createConfirmChannel();

            // Emit drain events back pressure recovery
            confirmChannel.on("drain",()=> this.emit('drain'));
            
            confirmChannel.on("close",()=>{
                this._logger.warn('[ChannelManager] confirm channel closed unexpectedly');
                this._channel = null;
            })

            confirmChannel.on("error",(err)=>{
                 this._logger.error('[ChannelManager] confirm channel error', {
                    error: err.message,
                    stack: err.stack,
                    code: err.code,
                });
                this._channel = null;
                this.emit('error', err)
            })
             this._channel = confirmChannel;
            this._logger.info('[ChannelManager] confirm channel ready');

            // Resolve all queued waiters waiting for this channel instance
            for (const w of this._connectWaiters) w.resolve(confirmChannel);
            this._connectWaiters = [];

            return confirmChannel;
        }catch (error) {
            // Reject all waiting promises if channel creation fails
            for (const w of this._connectWaiters) w.reject(error);
            this._connectWaiters = [];
            throw error;
        }
        finally {
            this._connecting = false
        }
    }
}