"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commonControl_1 = __importDefault(require("./commonControl"));
const tokenControlForFunction = async (req, res, next) => {
    const token = req.query.token;
    const { user } = await (0, commonControl_1.default)(token);
    req.user = user;
    next();
};
exports.default = tokenControlForFunction;
