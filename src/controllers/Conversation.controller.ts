import { Request, Response } from "express";
import jwt from 'jsonwebtoken';
import redis from "../libs/redis/redisConf";
import { AuthRequest } from "../middleware/tokenControl";
import Conversation from "../models/Conversation.model";
import User from "../models/User.model";
import { ConversationType } from "../Types/Types";


const getConversations = async(req: AuthRequest, res: Response) =>{
    try {
        const user = await User.findOne({lastLoginToken: req.query.token});
        if (!user) {
            return res.send({status: false, msg: "User is not found"});
        }

        let conversations = [] as any[];

        // await redis.del(`userId:${user._id}_conversations`);
        const cachedData = await redis.hgetall(`userId:${user._id}_conversations`);
        if (!cachedData || Object.keys(cachedData).length === 0) {
            conversations = await Conversation.find({"participants.user": user._id}).populate("lastMessage").populate("participants.user");
            // await redis.setex(`userId:${user._id}_conversations`, 3600, JSON.stringify(conversations));
            if (conversations.length > 0) {
                const hashPayload: Record<string, string> = {};
                
                conversations.forEach((conv) => {
                    hashPayload[conv._id.toString()] = JSON.stringify(conv);
                });

                await redis.hset(`userId:${user._id}_conversations`, hashPayload);
                await redis.expire(`userId:${user._id}_conversations`, 3600);
            }
        } else {
            conversations = Object.values(cachedData).map((item) => JSON.parse(item));

            // conversations.sort((a: any, b: any) => {
            //     const dateA = new Date(a.lastMessage?.createdAt || a.updatedAt || 0).getTime();
            //     const dateB = new Date(b.lastMessage?.createdAt || b.updatedAt || 0).getTime();
            //     return dateB - dateA; 
            // });
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
        // const allParticipantIds = [...new Set([...req.body.participants, req.params.id])];
        // const isGroup = allParticipantIds.length > 2 || !!req.body.groupName; 
        // if (!isGroup) {
            
        // }

        let array = [];
        for (const token of req.body.participants) {
            const accessTokenCode = jwt.verify(token, "accessTokenCode") as {userEmail: string};

            const user = await User.findOne({email: accessTokenCode.userEmail});
            if (!user) {
                return res.send({status: false, msg: "User is not found"});
            }
            array.push({user: user._id});
            
        }

        const newConver = new Conversation({
            isGroup: req.body.isGroup,
            groupName: req.body.groupName,
            participants: array,
            groupAdmin: array[0].user
        });
        await newConver.save();

        let participantsArray = [] as Array<String>;
        req.body.participants.map((item: { user: String; })=>{
            participantsArray.push(item.user);
        })
        await User.updateMany({_id: {$in: participantsArray}}, {$push: {conversations: {conversation: newConver._id}}});

        return res.send({status: true, newConver});
    } catch (error) {
        console.log("Error", error);
        return res.send({status: false});
    }
}



export { getConversationById, getConversations, newConversation };
