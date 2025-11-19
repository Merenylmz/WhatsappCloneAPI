import { json, Request, Response } from "express";
import Conversation from "../models/Conversation.model";
import { ConversationType } from "../Types/Types";
import { AuthRequest } from "../middleware/tokenControl";
import User from "../models/User.model";
import redis from "../libs/redis/redisConf";

const getConversationById = async(req: AuthRequest, res: Response) =>{
    try {
        const conversation = await Conversation.findOne({_id: req.params.id}).populate("participants.user").populate("lastMessage").populate("groupAdmin") as ConversationType;
        if (!conversation) {
            return res.send({status: false, msg: "Conversation is not found"});
        }
        if (conversation.participants.includes(req.user._id)) {
            return res.send({status: false, msg: "Forbidden Enter"});
        } 

        await redis.setex(`conversation:${req.user._id}`, 60*60*36, JSON.stringify(conversation));
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
        console.log(newConver);
        
        await User.updateMany({_id: {$in: participantsArray}}, {$push: {conversations: {conversation: newConver._id}}});

        return res.send({status: true, newConver});
    } catch (error) {
        console.log("Error");
        return res.send({status: false});
    }
}



export {newConversation, getConversationById};