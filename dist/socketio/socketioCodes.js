"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redisConf_1 = __importDefault(require("../libs/redis/redisConf"));
const Conversation_model_1 = __importDefault(require("../models/Conversation.model"));
const Message_model_1 = __importDefault(require("../models/Message.model"));
const User_model_1 = __importDefault(require("../models/User.model"));
const initializeSocketIO = (io) => {
    io.on("connection", async (socket) => {
        console.log(`Kullanıcı Bağlandı: ${socket.id} USERID: ${socket.userId}`);
        try {
            const user = await User_model_1.default.findOne({ _id: socket.userId });
            if (!user) {
                return {};
            }
            user.online = true;
            await user.save();
            const userConversations = await Conversation_model_1.default.find({
                "participants.user": socket.userId
            });
            userConversations.forEach((convo) => {
                socket.join(convo._id.toString());
                console.log(`Socket ${convo._id} odasına (Sohbet Odası) girdi.`);
            });
            socket.on("sendMessage", async ({ conversationId, content }) => {
                console.log("Starting Sending a Message");
                const senderId = socket.userId;
                if (!senderId) {
                    return false;
                }
                const newMessage = new Message_model_1.default({
                    content: content,
                    sender: senderId,
                    conversation: conversationId,
                    contentType: "Text"
                });
                await newMessage.save();
                console.log(senderId, content);
                const populatedMessage = await newMessage.populate('sender', 'username avatar');
                const conversation = await Conversation_model_1.default.findByIdAndUpdate(conversationId, {
                    lastMessage: newMessage._id
                });
                io.to(conversationId).emit("newMessage", populatedMessage);
                await redisConf_1.default.setex(`conversation:${conversationId}`, 60 * 60 * 36, JSON.stringify(conversation));
            });
        }
        catch (error) {
            console.log(error);
            return `Errorrrrrrr: ${error}`;
        }
        socket.on("joinRoom", (roomId) => {
            socket.join(roomId);
            console.log(`User ${socket.userId} manuel olarak ${roomId} odasına katıldı.`);
        });
        socket.on("typing", (data) => {
            socket
                .to(data.conversationId)
                .emit("userTyping", { userId: socket.userId });
        });
        socket.on("stopTyping", (data) => {
            socket
                .to(data.conversationId)
                .emit("userStopTyping", { userId: socket.userId });
        });
        socket.on("disconnect", async () => {
            console.log(`❌ Kullanıcı ayrıldı: ${socket.id} (User ID: ${socket.userId})`);
            //last seen güncelle
            // await Conversation.findOne({_id:});
            const user = await User_model_1.default.findOne({ _id: socket.userId });
            if (!user) {
                return {};
            }
            const now = new Date().toISOString();
            user.lastSeen = now;
            user.online = false;
            await user.save();
        });
    });
};
exports.default = initializeSocketIO;
