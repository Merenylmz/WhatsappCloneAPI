import mongoose from "mongoose";
import { MessageType } from "../Types/Types";

const messageSchema = new mongoose.Schema<MessageType>({
    sender: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    conversation: {type: mongoose.Schema.Types.ObjectId, ref: "Conversation"},
    content: {type: String},
    contentType: {type: String, required: false},
    readBy: {type: Boolean, required: false, default: false}
});


const Message = mongoose.model<MessageType>("Message", messageSchema);

export default Message;