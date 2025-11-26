"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commonControl_1 = __importDefault(require("./commonControl"));
const tokenControl = async (socket, next) => {
    try {
        const token = socket.handshake.query.token;
        const { user } = await (0, commonControl_1.default)(token);
        socket.userId = user._id;
        next();
    }
    catch (error) {
        return next(new Error('Authentication error: Token is not invalid'));
    }
};
exports.default = tokenControl;
