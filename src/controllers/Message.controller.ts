import { Response } from "express";
import { AuthRequest } from "../middleware/tokenControl";
import Message from "../models/Message.model";
import redis from "../libs/redis/redisConf";

// const changeReadBy = () =>{
//     try {
        
//     } catch (error) {
//         console.log(error);
//         return {};
//     }
// };

const getMessages = async(req: AuthRequest, res: Response) =>{
    try {
        let messages = [];
        
        
        const cachedData = await redis.hgetall(`messagesConversationId:${req.query.conversationid}`) as any;
        if (!cachedData) {
            messages = await Message.find({conversation: req.query.conversationid});
            
            // await redis.setex(`messagesConversationId:${req.query.conversationid}`, 1800, JSON.stringify(messages));
            await redis.hset(`messagesConversationId:${req.query.conversationid}`, {messages: messages});
            await redis.expire(`messagesConversationId:${req.query.conversationid}`, 1800);
        } else {
            messages = cachedData.messages;
        }
        
        return res.send({status: true, messages});
    } catch (error) {
        console.log(error);
        return res.send({status: false});
    }
};

export {getMessages};