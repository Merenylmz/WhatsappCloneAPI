import mongoose from "mongoose";
import { UserType } from "../Types/Types";

const userConversations = new mongoose.Schema({
    conversation: {type: mongoose.Schema.Types.ObjectId, ref: "Conversation"}
});
const userSchema = new mongoose.Schema<UserType>({
    username: String,
    email: String,
    password: String,
    avatar: {type: String, required: false},
    conversations: [userConversations],
    online: {type: Boolean, required: false},
    lastSeen: {type: String, required: false}
});


const User = mongoose.model<UserType>("User", userSchema);

export default User;