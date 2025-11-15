import amqp, { Channel } from "amqplib";

let channel : Channel;
export let rabbitMQConnectionStatus : any = false;
const connectionRabbit = async(uri: any) =>{
    setTimeout(async()=>{
        const connection = await amqp.connect(uri);
        channel = (await connection.createChannel());
        (await channel).assertQueue("taskQueue");
        rabbitMQConnectionStatus = true;
        console.log("✅ RabbitMQ Connected");
    }, 7000);
}

const sendToQueue = (data: any) =>{
    if (!channel) {
        return false;
    }
    channel.sendToQueue("taskQueue", Buffer.from(JSON.stringify(data)));
};

const consumeQueue = (callback: CallableFunction) =>{
    if (!channel) {
        return false;
    }
    channel.consume("taskQueue", (msg)=>{
        if (msg) {
            const content = JSON.parse(msg.content.toString());
            callback(content);
            channel.ack(msg);
        }
    });
};


export {sendToQueue, consumeQueue};
export default connectionRabbit;