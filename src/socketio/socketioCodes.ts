import { Server } from "socket.io";
import redis from "../libs/redis/redisConf";
import Conversation from "../models/Conversation.model";
import Message from "../models/Message.model";
import User from "../models/User.model";
import { AuthenticatedSocket } from "../Types/Types";

const initializeSocketIO = (io: Server) =>{
    io.on("connection", async(socket: AuthenticatedSocket)=>{
    console.log(`Kullanıcı Bağlandı: ${socket.id} USERID: ${socket.userId}`);
    try {
        const user = await User.findOne({_id: socket.userId});
        if (!user) {
            return {};
        }
        user.online = true;
        await user.save();

        const userConversations = await Conversation.find({ 
            "participants.user": socket.userId 
        });

        userConversations.forEach((convo) => {
            socket.join(convo._id.toString());
            console.log(`Socket ${convo._id} odasına (Sohbet Odası) girdi.`);
        });

        socket.on("sendMessage", async({conversationId, content})=>{
            const senderId = socket.userId;

            if (!senderId) {
                return false;
            }
            const newMessage = new Message({
                content: content,
                sender: senderId,
                conversation: conversationId,
                contentType: "Text"
            });
            await newMessage.save();

            const populatedMessage = await newMessage.populate('sender', 'username avatar');
            
            const conversation = await Conversation.findByIdAndUpdate(conversationId, {
                lastMessage: newMessage._id
            }, {new: true}); // new true burada bize güncellenmiş veriyi getirir
            
            io.to(conversationId).emit("newMessage", populatedMessage);
            if (conversation) {
                await redis.hset(`conversation:${conversationId}`, conversationId.toString(), JSON.stringify(conversation));
                await redis.expire(`conversation:${conversationId}`, 60*60*24);

                await redis.hset(`messagesConversationId:${conversationId}`, populatedMessage._id, JSON.stringify(populatedMessage));
                await redis.expire(`messagesConversationId:${conversationId}`, 60*60*24);
            }
        });
    } catch (error) {
        console.log(error);
        return `Errorrrrrrr: ${error}`;
    }
    socket.on("joinRoom", (roomId: string) => {
      socket.join(roomId);
      console.log(
        `User ${socket.userId} manuel olarak ${roomId} odasına katıldı.`
      );
    });
    socket.on("typing", async(data) => {
      socket
        .to(data.conversationId)
        .emit("userTyping", { userId: socket.userId });


        await Conversation.findOneAndUpdate({_id: data.conversationId}, {
            "lastMessage.readBy": true
        });
    });

    socket.on("stopTyping", (data) => {
      socket
        .to(data.conversationId)
        .emit("userStopTyping", { userId: socket.userId });
    });

    socket.on("disconnect", async() => {
    console.log(
        `❌ Kullanıcı ayrıldı: ${socket.id} (User ID: ${socket.userId})`
    );
        //last seen güncelle
        // await Conversation.findOne({_id:});
        const user = await User.findOne({_id: socket.userId});
        if (!user) {
            return {};
        }
        const now = new Date().toISOString();
        user.lastSeen = now;
        user.online = false;
        await user.save();
    });
});
}

export default initializeSocketIO;













