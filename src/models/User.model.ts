import mongoose from "mongoose";
import { UserType } from "../Types/Types";

const userConversationSchema = new mongoose.Schema({
    conversation: {type: mongoose.Schema.Types.ObjectId, ref: "Conversation"}
});
const friendRequestSchema = new mongoose.Schema({
    personId: {type: mongoose.Schema.Types.ObjectId, ref: "User"}
});
const userSchema = new mongoose.Schema<UserType>({
    username: {type: String, unique: true},
    email: String,
    password: String,
    avatar: {type: String, required: false},
    conversations: [userConversationSchema],
    online: {type: Boolean, required: false},
    lastSeen: {type: String, required: false},
    lastLoginToken: {type: String, required: false},
    QRCodeURI: {type: String, required: false},
    QRCodeToken: {type:String, required: false},
    forgotPasswordToken: {type: String, required: false},
    accessCode: {type: String, required: true},
    friendRequests: {type:[friendRequestSchema], required: false}
});


const User = mongoose.model<UserType>("User", userSchema);

export default User;