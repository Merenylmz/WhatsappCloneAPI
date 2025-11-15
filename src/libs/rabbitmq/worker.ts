// import { sendMail } from "../nodemailer/configureNodeMailer";
import { consumeQueue, rabbitMQConnectionStatus } from "./rabbitMQConf";
// import workerpool from "workerpool";

// const pool = workerpool.pool({maxWorkers: 4});
const processQueueOnce = async() =>{
    if (!rabbitMQConnectionStatus) {
        return console.log("Please Check Connection(Rabbit)");
    }
    consumeQueue(async (msg: {type: string, payload?: any})=>{
        // console.log(msg);
        switch (msg.type) {
            case "sendMail":
                if (msg.payload) {
                    // await sendMail(msg.payload);
                    // await runMailThread(msg.payload);
                } else {
                    return console.log("If Your wanna send email, please enter payload information.");
                }
                break;
            default:
                console.log("Please Check your Rabbit consume name");
                break;
        }
    });
}

export default processQueueOnce;