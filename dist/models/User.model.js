"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userConversations = new mongoose_1.default.Schema({
    conversation: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Conversation" }
});
const userSchema = new mongoose_1.default.Schema({
    username: String,
    email: String,
    password: String,
    avatar: { type: String, required: false },
    conversations: [userConversations],
    online: { type: Boolean, required: false },
    lastSeen: { type: String, required: false },
    lastLoginToken: { type: String, required: false },
    QRCodeURI: { type: String, required: false },
    QRCodeToken: { type: String, required: false },
    forgotPasswordToken: { type: String, required: false }
});
const User = mongoose_1.default.model("User", userSchema);
exports.default = User;
