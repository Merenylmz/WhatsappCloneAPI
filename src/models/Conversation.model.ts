import mongoose from "mongoose";
import {ConversationType} from "../Types/Types";

const conversationParticipantsSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User"}
});
const conversationSchema = new mongoose.Schema<ConversationType>({
    participants: [conversationParticipantsSchema],
    isGroup: {type: Boolean, required: false},
    groupName: {type: String, required: false, default: "Group"},
    groupAdmin: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    lastMessage: {type: mongoose.Schema.Types.ObjectId, ref: "Message"}
});


const Conversation = mongoose.model<ConversationType>("Conversation", conversationSchema);

export default Conversation;