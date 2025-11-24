"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const node_cron_1 = __importDefault(require("node-cron"));
const rabbitMQConf_1 = require("../rabbitmq/rabbitMQConf");
const mongoose_1 = __importDefault(require("mongoose"));
const redisConf_1 = require("../redis/redisConf");
const worker_1 = __importDefault(require("../rabbitmq/worker"));
const schedules = () => {
    node_cron_1.default.schedule("* * * * *", async () => {
        console.log("Schedule Running...");
        await (0, worker_1.default)();
    });
    node_cron_1.default.schedule("0 0 */12 * * *", async () => {
        console.log("Control Schedule running");
        (0, rabbitMQConf_1.sendToQueue)({
            type: "sendMail",
            payload: {
                to: `m.erenyilmaz2007@gmail.com`,
                subject: "Daily Check Mail",
                body: `
                    <p>MongoDb Status: ${mongoose_1.default.STATES.connected == 1 ? "Okay" : "Mongo Db Connection Error"}</p>
                    <p>RabbitMQ Status: ${rabbitMQConf_1.rabbitMQConnectionStatus ? "Okay" : "RabbitMQ Connection Error"}</p>
                    <p>Redis Status: ${redisConf_1.redisStatus ? "Okay" : "IORedis Connection Error"}</p>
                    <p>System Status: ${(0, express_1.default)() && "Okay"}</p>
                `
            }
        });
    });
};
exports.default = schedules;
