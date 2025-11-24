import express from 'express';
import nodeCron from "node-cron";
import { rabbitMQConnectionStatus, sendToQueue } from "../rabbitmq/rabbitMQConf";
import mongoose from "mongoose";
import { redisStatus } from "../redis/redisConf";
import processQueueOnce from '../rabbitmq/worker';

const schedules = () =>{
    nodeCron.schedule("* * * * *", async()=>{
        console.log("Schedule Running...");
        await processQueueOnce();
    });

    nodeCron.schedule("0 0 */12 * * *", async()=>{
        console.log("Control Schedule running");
        sendToQueue({
            type: "sendMail",
            payload: {
                to: `m.erenyilmaz2007@gmail.com`,
                subject: "Daily Check Mail",
                body: `
                    <p>MongoDb Status: ${mongoose.STATES.connected == 1 ? "Okay" : "Mongo Db Connection Error"}</p>
                    <p>RabbitMQ Status: ${rabbitMQConnectionStatus ? "Okay" : "RabbitMQ Connection Error"}</p>
                    <p>Redis Status: ${redisStatus ? "Okay" : "IORedis Connection Error"}</p>
                    <p>System Status: ${express() && "Okay"}</p>
                `
            }
        });
    });
};

export default schedules;