"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConversationById = exports.newConversation = void 0;
const Conversation_model_1 = __importDefault(require("../models/Conversation.model"));
const User_model_1 = __importDefault(require("../models/User.model"));
const redisConf_1 = __importDefault(require("../libs/redis/redisConf"));
const getConversationById = async (req, res) => {
    try {
        const conversation = await Conversation_model_1.default.findOne({ _id: req.params.id }).populate("participants.user").populate("lastMessage").populate("groupAdmin");
        if (!conversation) {
            return res.send({ status: false, msg: "Conversation is not found" });
        }
        if (conversation.participants.includes(req.user._id)) {
            return res.send({ status: false, msg: "Forbidden Enter" });
        }
        await redisConf_1.default.setex(`conversation:${req.params.id}`, 60 * 60 * 36, JSON.stringify(conversation));
        return res.send({ status: true, conversation });
    }
    catch (error) {
        console.log("Error", error);
        return res.send({ status: false });
    }
};
exports.getConversationById = getConversationById;
const newConversation = async (req, res) => {
    try {
        const allParticipantIds = [...new Set([...req.body.participants, req.params.id])];
        const isGroup = allParticipantIds.length > 2 || !!req.body.groupName;
        if (!isGroup) {
        }
        const newConver = new Conversation_model_1.default({
            isGroup: req.body.isGroup,
            groupName: req.body.groupName,
            participants: req.body.participants,
            groupAdmin: req.body.participants[0].user
        });
        await newConver.save();
        let participantsArray = [];
        req.body.participants.map((item) => {
            participantsArray.push(item.user);
        });
        console.log(newConver);
        await User_model_1.default.updateMany({ _id: { $in: participantsArray } }, { $push: { conversations: { conversation: newConver._id } } });
        return res.send({ status: true, newConver });
    }
    catch (error) {
        console.log("Error");
        return res.send({ status: false });
    }
};
exports.newConversation = newConversation;
