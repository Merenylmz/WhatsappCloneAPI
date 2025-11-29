import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User.model";
import jwt from "jsonwebtoken";
import redis from "../libs/redis/redisConf";
import { sendToQueue } from "../libs/rabbitmq/rabbitMQConf";

export const register = async(req: Request, res: Response) =>{
    try {
        const user = await User.findOne({email: req.body.email});  
        if (user) {
            return res.send({msg: "User is already exists", status: false});
        }      
        const hash = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, hash);
        const newUser = new User({email: req.body.email, password: hashedPassword, username: req.body.username});
        await newUser.save();


        return res.send({msg: "User is Registered", status: true});
    } catch (error) {
        console.log(error);
        return false;
    }
};
export const login = async(req: Request, res: Response) =>{
    try {
        const user = await User.findOne({email: req.body.email});  
        if (!user) {
            return res.send({msg: "User is not found", status: false});
        }   
        const passwordControl = await bcrypt.compare(req.body.password, (user.password as string));
        if (!passwordControl) {
            return res.send({msg: "Password is incorrect", status:false});
        }

        const token = jwt.sign({userId: user._id}, process.env.PRIVATE_KEY!);
        // await redis.set(`loginlist:${user._id.toString()}`, token, "EX", 60*20);
        await redis.hset(`loginlist:${user._id.toString()}`, {token: token});
        await redis.expire(`loginlist:${user._id.toString()}`, 1200);
        user.lastLoginToken = token;
        await user.save();
        
        return res.send({token, status: true});
    } catch (error) {
        console.log(error);
        return false;
    }
};

export const forgotPassword = async(req: Request, res: Response) =>{
    try {
        const user = await User.findOne({email: req.body.email});
        if (!user) {
            return res.send({status: false, msg: "User is not found"});
        }
        const token = await jwt.sign({userId: user._id}, process.env.PRIVATE_KEY!);
        user.forgotPasswordToken = token;
        await user.save();
        sendToQueue({
            type: "sendMail",
            payload: {
                to: req.body.email,
                subject: "Forgot Password Mail",
                body: `<p>If you wanna change your password, You can press the link</p> <br /> <a href="http://localhost:3002/users/newpassword?token=${token}"></a>`
            }
        });

        return res.send({status: true, msg: "Mail Sended"});
    } catch (error) {
        console.log(error);
        return false;
    }
};

export const newPassword = async(req: Request, res: Response) =>{
    try {
        const user = await User.findOne({forgotPasswordToken: req.query.token});
        if (!user) {
            return res.send({status: false, msg: "User is not found"});
        }

        const hash = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, hash);
        user.password = hashedPassword;
        user.forgotPasswordToken = "";
        await user.save();

        return res.send({status: true, msg: "Password Changed"});
    } catch (error) {
        console.log(error);
        return false;
    }
};
