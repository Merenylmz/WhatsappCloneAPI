import jwt from 'jsonwebtoken';
import express, { NextFunction, Request, Response } from "express";
import mongoose, { now } from "mongoose";
import dotenv from "dotenv";
import connectionRabbit, { rabbitMQConnectionStatus } from "./libs/rabbitmq/rabbitMQConf";
import userRoutes from "./routes/User.routes";
import conversationRoutes from "./routes/Conversation.routes";
import cors from "cors";
import { redisStatus } from "./libs/redis/redisConf";
import {createServer} from "node:http";
import {Server} from "socket.io";
import { AuthenticatedSocket } from "./Types/Types";
import tokenControl from './middleware/socketIOTokenControl';
import Conversation from './models/Conversation.model';
import Message from './models/Message.model';
import User from './models/User.model';

const app = express();
const server = createServer(app);
const io = new Server(server);

dotenv.config({quiet: true});

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cors({
    origin: "*"
}));


app.get("/health", (req: Request, res: Response)=>{
    res.send({
        systemStatus: true,
        databaseStatus: mongoose.STATES.connected == 1 ? true : false,
        redisStatus,
        rabbitMQStatus: rabbitMQConnectionStatus,
    });
});

io.use(tokenControl);

io.on("connection", async(socket: AuthenticatedSocket)=>{
    console.log(`Kullanıcı Bağlandı: ${socket.id} USERID: ${socket.userId}`);
    try {
        const user = await User.findOne({_id: socket.userId});
        if (!user) {
            return {};
        }
        user.online = true;
        await user.save();
        const userConversations = await Conversation.find({participants: socket.userId});

        userConversations.forEach((convo)=>{
            socket.join(convo._id.toString());
            console.log("Convo", convo);
        });

        socket.on("sendMessage", async({conversationId, content})=>{
            console.log("Starting Sending a Message");
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
            await Conversation.findByIdAndUpdate(conversationId, {
                lastMessage: newMessage._id
            });
            io.to(conversationId).emit("newMessage", populatedMessage);

        });
    } catch (error) {
        console.log(error);
        return error;
    }
    socket.on("joinRoom", (roomId: string) => {
      socket.join(roomId);
      console.log(
        `User ${socket.userId} manuel olarak ${roomId} odasına katıldı.`
      );
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


app.get("/", (req, res)=>{
    res.send("Hello");
});
app.use("/users", userRoutes);
app.use("/conversations", conversationRoutes); 

server.listen(process.env.PORT!, ()=>{
    console.log("✅ Listening a PORT");
    (async()=>{
        await mongoose.connect(process.env.MongoDbUri!);
        mongoose.STATES.connected == 1 && console.log("✅ MongoDb Connected");
        setTimeout(async()=>{
            await connectionRabbit(process.env.RMQUri!);
            console.log("Ready to Smash :)");
        }, 7);
    })();
});