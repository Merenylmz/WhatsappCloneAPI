"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.consumeQueue = exports.sendToQueue = exports.rabbitMQConnectionStatus = void 0;
const amqplib_1 = __importDefault(require("amqplib"));
let channel;
exports.rabbitMQConnectionStatus = false;
const connectionRabbit = async (uri) => {
    setTimeout(async () => {
        const connection = await amqplib_1.default.connect(uri);
        channel = (await connection.createChannel());
        (await channel).assertQueue("taskQueue");
        exports.rabbitMQConnectionStatus = true;
        console.log("✅ RabbitMQ Connected");
    }, 7000);
};
const sendToQueue = (data) => {
    if (!channel) {
        return false;
    }
    channel.sendToQueue("taskQueue", Buffer.from(JSON.stringify(data)));
};
exports.sendToQueue = sendToQueue;
const consumeQueue = (callback) => {
    if (!channel) {
        return false;
    }
    channel.consume("taskQueue", (msg) => {
        if (msg) {
            const content = JSON.parse(msg.content.toString());
            callback(content);
            channel.ack(msg);
        }
    });
};
exports.consumeQueue = consumeQueue;
exports.default = connectionRabbit;
