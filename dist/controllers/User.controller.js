"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newPassword = exports.forgotPassword = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_model_1 = __importDefault(require("../models/User.model"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const redisConf_1 = __importDefault(require("../libs/redis/redisConf"));
const rabbitMQConf_1 = require("../libs/rabbitmq/rabbitMQConf");
const register = async (req, res) => {
    try {
        const user = await User_model_1.default.findOne({ email: req.body.email });
        if (user) {
            return res.send({ msg: "User is already exists", status: false });
        }
        const hash = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(req.body.password, hash);
        const newUser = new User_model_1.default({ email: req.body.email, password: hashedPassword, username: req.body.username });
        await newUser.save();
        return res.send({ msg: "User is Registered", status: true });
    }
    catch (error) {
        console.log(error);
        return false;
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const user = await User_model_1.default.findOne({ email: req.body.email });
        if (!user) {
            return res.send({ msg: "User is not found", status: false });
        }
        const passwordControl = await bcrypt_1.default.compare(req.body.password, user.password);
        if (!passwordControl) {
            return res.send({ msg: "Password is incorrect", status: false });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.PRIVATE_KEY);
        await redisConf_1.default.set(`loginlist:${token}`, user._id.toString(), "EX", 60 * 20);
        user.lastLoginToken = token;
        await user.save();
        return res.send({ token, status: true });
    }
    catch (error) {
        console.log(error);
        return false;
    }
};
exports.login = login;
const forgotPassword = async (req, res) => {
    try {
        const user = await User_model_1.default.findOne({ email: req.body.email });
        if (!user) {
            return res.send({ status: false, msg: "User is not found" });
        }
        const token = await jsonwebtoken_1.default.sign({ userId: user._id }, process.env.PRIVATE_KEY);
        user.forgotPasswordToken = token;
        await user.save();
        (0, rabbitMQConf_1.sendToQueue)({
            type: "sendMail",
            payload: {
                to: req.body.email,
                subject: "Forgot Password Mail",
                body: `<p>If you wanna change your password, You can press the link</p> <br /> <a href="http://localhost:3002/users/newpassword?token=${token}"></a>`
            }
        });
        return res.send({ status: true, msg: "Mail Sended" });
    }
    catch (error) {
        console.log(error);
        return false;
    }
};
exports.forgotPassword = forgotPassword;
const newPassword = async (req, res) => {
    try {
        const user = await User_model_1.default.findOne({ forgotPasswordToken: req.query.token });
        if (!user) {
            return res.send({ status: false, msg: "User is not found" });
        }
        const hash = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(req.body.password, hash);
        user.password = hashedPassword;
        user.forgotPasswordToken = "";
        await user.save();
        return res.send({ status: true, msg: "Password Changed" });
    }
    catch (error) {
        console.log(error);
        return false;
    }
};
exports.newPassword = newPassword;
