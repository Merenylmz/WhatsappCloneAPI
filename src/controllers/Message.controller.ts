import { Response } from "express";
import { AuthRequest } from "../middleware/tokenControl";
import Message from "../models/Message.model";
import redis from "../libs/redis/redisConf";

const changeReadBy = () =>{
    try {
        
    } catch (error) {
        console.log(error);
        return {};
    }
};

const getMessages = async(req: AuthRequest, res: Response) =>{
    try {
        let messages = [];
        
        
        const cachedData = await redis.get(`messagesConversationId:${req.query.conversationid}`);
        if (!cachedData) {
            messages = await Message.find({conversation: req.query.conversationid});
            
            await redis.setex(`messagesConversationId:${req.query.conversationid}`, 1800, JSON.stringify(messages));
        } else {
            messages = JSON.parse(cachedData);
        }
        
        return res.send({status: true, messages});
    } catch (error) {
        console.log(error);
        return res.send({status: false});
    }
};

export {getMessages};