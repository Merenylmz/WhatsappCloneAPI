"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import { sendMail } from "../nodemailer/configureNodeMailer";
const threadRunner_1 = require("../threads/threadRunner");
const rabbitMQConf_1 = require("./rabbitMQConf");
// import workerpool from "workerpool";
// const pool = workerpool.pool({maxWorkers: 4});
const processQueueOnce = async () => {
    if (!rabbitMQConf_1.rabbitMQConnectionStatus) {
        return console.log("Please Check Connection(Rabbit)");
    }
    (0, rabbitMQConf_1.consumeQueue)(async (msg) => {
        // console.log(msg);
        switch (msg.type) {
            case "sendMail":
                if (msg.payload) {
                    // await sendMail(msg.payload);
                    await (0, threadRunner_1.runMailThread)(msg.payload);
                }
                else {
                    return console.log("If Your wanna send email, please enter payload information.");
                }
                break;
            default:
                console.log("Please Check your Rabbit consume name");
                break;
        }
    });
};
exports.default = processQueueOnce;
