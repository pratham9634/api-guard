import dotenv from "dotenv";
dotenv.config();

const config = {
    //node env & port
    node_env: process.env.NODE_ENV,
    port: parseInt(process.env.PORT || 3000,10),

    //mongodb
    mongo : {
        mongo_url: process.env.MONGO_URL || "mongodb://localhost:27017/api_guard",
        mongo_db_name: process.env.MONGO_DB_NAME || "api_guard",
    },

    //jwt
    jwt:{
        jwt_secret: process.env.JWT_SECRET,
        jwt_expires_in: process.env.JWT_EXPIRES_IN,
    },

    //postress
    postgres: {
        host : process.env.POSTGRES_HOST || "localhost",
        port : parseInt(process.env.POSTGRES_PORT || 5432,10),
        user : process.env.POSTGRES_USER || "postgres",
        password : process.env.POSTGRES_PASSWORD || "postgres",
        database : process.env.POSTGRES_DB || "api_guard",
    },

    //rabbitmq
    rabbitmq: {
        url : process.env.RABBITMQ_URL || "amqp://localhost:5672",
        queue : process.env.RABBITMQ_QUEUE || "api_hits",
        publisherConfirm : process.env.RABBITMQ_PUBLISHER_CONFIRM === "true" || "false",  
        retryAttempts : parseInt(process.env.RABBITMQ_RETRY_ATTEMPTS || 3,10),
        retryDelay : parseInt(process.env.RABBITMQ_RETRY_DELAY || 1000,10),
    },

    

    //rate limiter
    rateLimit : {
        windowMs : parseInt(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,10),//15 minutes
        maxRequests : parseInt(process.env.RATE_LIMIT_MAX || 100,10),//100 requests per 15 minutes
    },

    //cookie
    cookie : {
        httpOnly : true,
        secure : process.env.NODE_ENV === "production",
        sameSite : "strict",
        maxAge : 24 * 60 * 60 * 1000,
    },

}
export default config;