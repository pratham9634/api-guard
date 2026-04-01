import pg from "pg";
import config from "./config.js";
import logger from "./logger.js";

const {Pool} = pg;

class PostgresConnection{
    constructor(){
        this.pool = null;
    }
    getPool(){
        if(!this.pool){
            this.pool = new Pool({
                host: config.postgres.host,
                port: config.postgres.port,
                user: config.postgres.user,
                password: config.postgres.password,
                database: config.postgres.database,
                max: 20,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 2000,
            })

            this.pool.on("error",err=>{
                logger.error("Unexpected error on postgres client",err);
            })
            logger.info("Postress pool created")
            return this.pool;
        }
    }

    async testConnection(){
        try{
            const pool = this.getPool();
            const client = await pool.connect();
            const result = await client.query("SELECT NOW()");
            client.release();
            logger.info("Postgres connection test successful",result.rows[0].now);
        }catch(error){
            logger.error("Postgres connection test failed",error);
            throw new Error("Failed to connect to Postgres");

        }
    }
    async close(){
        if(this.pool){
            await this.pool.end();
            this.pool = null;
            logger.info("Postgres connection closed");
        }
    }

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