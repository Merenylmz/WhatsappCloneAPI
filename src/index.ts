import express, { Request, Response } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import connectionRabbit, { rabbitMQConnectionStatus } from "./libs/rabbitmq/rabbitMQConf";
import userRoutes from "./routes/User.routes";
import conversationRoutes from "./routes/Conversation.routes";
import cors from "cors";
import { redisStatus } from "./libs/redis/redisConf";
import {createServer} from "node:http";
import {Server} from "socket.io";
import tokenControl from './middleware/socketIOTokenControl';
import initializeSocketIO from './socketio/socketioCodes';
import schedules from './libs/schedules/nodeCronSchedule';

const app = express();
const server = createServer(app);
const io = new Server(server);

dotenv.config({quiet: true});

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cors({
    origin: "*"
}));


app.use("/public", express.static("public"));


app.get("/health", (req: Request, res: Response)=>{
    res.send({systemStatus: true, databaseStatus: mongoose.STATES.connected == 1 ? true : false, redisStatus, rabbitMQStatus: rabbitMQConnectionStatus, });
});
app.get("/", (req, res)=>{res.send("Hello");});
app.use("/users", userRoutes);
app.use("/conversations", conversationRoutes); 


io.use(tokenControl);
initializeSocketIO(io);


schedules();


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