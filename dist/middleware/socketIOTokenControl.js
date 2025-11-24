"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const tokenControl = (socket, next) => {
    const token = socket.handshake.query.token;
    // if (!token) {
    //     return next(new Error("Autheticated Error: Token is not found"));
    // }    
    console.log(token);
    try {
        const payload = jsonwebtoken_1.default.verify(token, process.env.PRIVATE_KEY);
        socket.userId = payload.userId;
        next();
    }
    catch (error) {
        return next(new Error('Authentication error: Token is not invalid'));
    }
};
exports.default = tokenControl;
