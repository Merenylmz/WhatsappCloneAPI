"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisStatus = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const redis = new ioredis_1.default(process.env.RedisUri);
redis.on("error", (err) => { console.log("Redis ", err); exports.redisStatus = false; });
redis.on('ready', () => {
    exports.redisStatus = true;
    console.log('✅ Redis Connected');
});
exports.default = redis;
