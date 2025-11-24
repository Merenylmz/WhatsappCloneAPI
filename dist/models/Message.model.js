"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const messageSchema = new mongoose_1.default.Schema({
    sender: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
    conversation: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Conversation" },
    content: { type: String },
    contentType: { type: String, required: false },
    readBy: { type: Boolean, required: false, default: false }
});
const Message = mongoose_1.default.model("Message", messageSchema);
exports.default = Message;
