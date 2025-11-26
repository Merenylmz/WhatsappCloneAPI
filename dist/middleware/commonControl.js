"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_model_1 = __importDefault(require("../models/User.model"));
const redisConf_1 = __importDefault(require("../libs/redis/redisConf"));
const tokenControlFunction = async (token) => {
    if (!token) {
        return { status: false, msg: "Token is not found" };
    }
    const decodedToken = await jsonwebtoken_1.default.verify(token, process.env.PRIVATE_KEY);
    const user = await User_model_1.default.findOne({ _id: decodedToken.userId });
    if (!user) {
        return { status: false, msg: "User is not found" };
    }
    const redisToken = await redisConf_1.default.get(`loginlist:${token}`);
    if (token != user.lastLoginToken) {
        return { status: false, msg: "Token is not valid" };
    }
    if (user.lastLoginToken != redisToken) {
        return { status: false, msg: "Token is Expired" };
    }
    return { user, status: true, msg: "Control Finished" };
};
exports.default = tokenControlFunction;
