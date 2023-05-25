const redis = require("redis");
const ErrorResponse = require("../error_handler/errorResponse");
const redisClient = redis.createClient();

const connectRedis =() => {
    redisClient.connect()
    .then(()=>{
        console.log('💛Redis connection is setup successfully.💛')
    })
    .catch((error) => {
        console.log('💛 Error connecting with Redis.💛')
        console.log('💛 redisError:',error)
    })
}

module.exports = {redisClient, connectRedis}



/*

   const redis = require("redis");
   export const redisClient = redis.createClient({ host: "redis_cache" });

   (async () => {
     redisClient.on("error", (err: any) => console.log("Redis Client Error", err));
     redisClient.on("connect", () => {
        console.log("connected to Redis");
      });
     await redisClient.connect();
   })
*/