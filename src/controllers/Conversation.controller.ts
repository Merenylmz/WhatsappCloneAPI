import { json, Request, Response } from "express";
import Conversation from "../models/Conversation.model";
import { ConversationType } from "../Types/Types";
import { AuthRequest } from "../middleware/tokenControl";
import User from "../models/User.model";
import redis from "../libs/redis/redisConf";


const getConversations = async(req: AuthRequest, res: Response) =>{
    try {
        const user = await User.findOne({lastLoginToken: req.params.token});
        if (!user) {
            return res.send({status: false, msg: "User is not found"});
        }

        let conversations = [] as any[];

        // await redis.del(`userId:${user._id}_conversations`);
        const cachedData = await redis.get(`userId:${user._id}_conversations`) as string;
        if (!cachedData) {
            conversations = await Conversation.find({"participants.user": user._id}).populate("lastMessage").populate("participants.user");
            await redis.setex(`userId:${user._id}_conversations`, 3600, JSON.stringify(conversations));
        } else {
            conversations = JSON.parse(cachedData);
        }
        return res.send({status: true, conversations});
    } catch (error) {
        console.log("Error", error);
        return res.send({status: false});
    }
}


const getConversationById = async(req: AuthRequest, res: Response) =>{
    try {
        const conversation = await Conversation.findOne({_id: req.params.id}).populate("participants.user").populate("lastMessage").populate("groupAdmin") as ConversationType;
        if (!conversation) {
            return res.send({status: false, msg: "Conversation is not found"});
        }
        if (conversation.participants.includes(req.user._id)) {
            return res.send({status: false, msg: "Forbidden Enter"});
        } 

        // await redis.setex(`conversation:${req.params.id}`, 60*60*36, JSON.stringify(conversation));
        return res.send({status: true, conversation});
    } catch (error) {
        console.log("Error", error);
        return res.send({status: false});
    }
}

const newConversation = async(req: Request, res: Response) =>{
    try {
        const allParticipantIds = [...new Set([...req.body.participants, req.params.id])];
        const isGroup = allParticipantIds.length > 2 || !!req.body.groupName; 
        if (!isGroup) {
            
        }
        const newConver = new Conversation({
            isGroup: req.body.isGroup,
            groupName: req.body.groupName,
            participants: req.body.participants,
            groupAdmin: req.body.participants[0].user
        });
        await newConver.save();

        let participantsArray = [] as Array<String>;
        req.body.participants.map((item: { user: String; })=>{
            participantsArray.push(item.user);
        })
        await User.updateMany({_id: {$in: participantsArray}}, {$push: {conversations: {conversation: newConver._id}}});

        return res.send({status: true, newConver});
    } catch (error) {
        console.log("Error");
        return res.send({status: false});
    }
}



export {newConversation, getConversationById, getConversations};