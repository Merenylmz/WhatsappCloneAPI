import Redis from "ioredis";

const redis = new Redis(process.env.RedisUri!);

export let redisStatus: any;

redis.on("error", (err)=>{console.log("Redis ", err); redisStatus = false})
redis.on('ready', () => {
    redisStatus = true;
    console.log('✅ Redis Connected');
});

export default redis;