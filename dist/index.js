"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const rabbitMQConf_1 = __importStar(require("./libs/rabbitmq/rabbitMQConf"));
const User_routes_1 = __importDefault(require("./routes/User.routes"));
const Conversation_routes_1 = __importDefault(require("./routes/Conversation.routes"));
const cors_1 = __importDefault(require("cors"));
const redisConf_1 = require("./libs/redis/redisConf");
const node_http_1 = require("node:http");
const socket_io_1 = require("socket.io");
const socketIOTokenControl_1 = __importDefault(require("./middleware/socketIOTokenControl"));
const socketioCodes_1 = __importDefault(require("./socketio/socketioCodes"));
const nodeCronSchedule_1 = __importDefault(require("./libs/schedules/nodeCronSchedule"));
const app = (0, express_1.default)();
const server = (0, node_http_1.createServer)(app);
const io = new socket_io_1.Server(server);
dotenv_1.default.config({ quiet: true });
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: "*"
}));
app.use("/public", express_1.default.static("public"));
app.get("/health", (req, res) => {
    res.send({ systemStatus: true, databaseStatus: mongoose_1.default.STATES.connected == 1 ? true : false, redisStatus: redisConf_1.redisStatus, rabbitMQStatus: rabbitMQConf_1.rabbitMQConnectionStatus, });
});
app.get("/", (req, res) => { res.send("Hello"); });
app.use("/users", User_routes_1.default);
app.use("/conversations", Conversation_routes_1.default);
io.use(socketIOTokenControl_1.default);
(0, socketioCodes_1.default)(io);
(0, nodeCronSchedule_1.default)();
server.listen(process.env.PORT, () => {
    console.log("✅ Listening a PORT");
    (async () => {
        await mongoose_1.default.connect(process.env.MongoDbUri);
        mongoose_1.default.STATES.connected == 1 && console.log("✅ MongoDb Connected");
        setTimeout(async () => {
            await (0, rabbitMQConf_1.default)(process.env.RMQUri);
            console.log("Ready to Smash :)");
        }, 7);
    })();
});
