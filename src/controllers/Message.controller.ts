import { Response } from "express";
import { AuthRequest } from "../middleware/tokenControl";
import Message from "../models/Message.model";
import redis from "../libs/redis/redisConf";


const getMessages = async(req: AuthRequest, res: Response) =>{
    try {
        let messages = [];
        const cachedData = await redis.hgetall(`messagesConversationId:${req.query.conversationid}`) as any;
        
        if (!cachedData[0]) {
            messages = await Message.find({conversation: req.query.conversationid}).populate("sender");
            
            // await redis.setex(`messagesConversationId:${req.query.conversationid}`, 1800, JSON.stringify(messages));
            // await redis.hset(`messagesConversationId:${req.query.conversationid}`, {messages: messages});
            for (let i = 0; i < messages.length; i++) {
                await redis.hset(`messagesConversationId:${req.query.conversationid}`, messages[i]._id, JSON.stringify(messages[i]));
            }
            await redis.expire(`messagesConversationId:${req.query.conversationid}`, 1800);
            
        } else {
            messages = cachedData;
        }
        
        return res.send({status: true, messages});
    } catch (error) {
        console.log(error);
        return res.send({status: false, error});
    }
};

export {getMessages};

