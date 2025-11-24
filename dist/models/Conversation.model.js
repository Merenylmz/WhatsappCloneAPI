"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const conversationParticipantsSchema = new mongoose_1.default.Schema({
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" }
});
const conversationSchema = new mongoose_1.default.Schema({
    participants: [conversationParticipantsSchema],
    isGroup: { type: Boolean, required: false },
    groupName: { type: String, required: false, default: "Group" },
    groupAdmin: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
    lastMessage: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Message" }
});
const Conversation = mongoose_1.default.model("Conversation", conversationSchema);
exports.default = Conversation;
