/**
 * @file postgres.js
 * @description Configures and manages the PostgreSQL database connection pool.
 * Implements methods for testing connections, querying with elapsed timing logging, and graceful closing of the pool.
 */

import pg from "pg";
import config from "./index.js";
import logger from "./logger.js";

const {Pool} = pg;

/**
 * PostgreSQL connection pool helper class.
 */
class PostgresConnection{
    constructor(){
        /**
         * Postgres connection pool instance.
         * @type {pg.Pool|null}
         */
        this.pool = null;
    }

    /**
     * Initializes and returns the active Pool instance.
     * Configures max pool size, idle timeouts, and connection timeouts.
     * @returns {pg.Pool}
     */
    getPool(){
        if(!this.pool){
            this.pool = new Pool({
                host: config.postgres.host,
                port: config.postgres.port,
                user: config.postgres.user,
                password: config.postgres.password,
                database: config.postgres.database,
                ssl: 
                    process.env.NODE_ENV === "production"
                        ? { rejectUnauthorized: false }
                        : false,
                max: 20, // Keep maximum of 20 concurrent connections in the pool
                idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
                connectionTimeoutMillis: 2000, // Timeout connection attempts after 2 seconds
            })

            // Catch unexpected client errors and log them to avoid process termination
            this.pool.on("error",err=>{
                logger.error("Unexpected error on postgres client",err);
            })
            logger.info("Postgres pool created")
        }
         return this.pool;
     }

    /**
     * Attempts to lease a client from the pool and execute a simple query.
     * Verifies that the PG configuration and credentials are correct.
     * @throws {Error} If connection test fails.
     */
    async testConnection(){
        try{
            const pool = this.getPool();
            const client = await pool.connect();
            const result = await client.query("SELECT NOW()");
            client.release(); // Return client back to the pool
            logger.info("Postgres connection test successful",result.rows[0].now);
        }catch(error){
            logger.error("Postgres connection test failed",error);
            throw new Error("Failed to connect to Postgres");

        }
    }

    /**
     * Shuts down the connection pool, waiting for all checked-out clients to return.
     */
    async close(){
        if(this.pool){
            await this.pool.end();
            this.pool = null;
            logger.info("Postgres connection closed");
        }
    }

    /**
     * Wraps PG query function. Automatically logs execution time of queries.
     * @param {string} text - SQL command template
     * @param {any[]} params - Parameterized query values
     * @returns {Promise<pg.QueryResult>}
     */
    async query(text,params){
        const client = this.getPool();
        const start = Date.now();
        try{
            const result = await client.query(text,params);
            const duration = Date.now() - start;
            logger.debug(`postgres query: ${text}`,{duration,params});
            return result;
        }catch(error){
            logger.error("Postgres query failed",error);
            throw error;
        }
    }
}

export default new PostgresConnection();