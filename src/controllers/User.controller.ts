import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User.model";
import jwt from "jsonwebtoken";
import redis from "../libs/redis/redisConf";

export const register = async(req: Request, res: Response) =>{
    try {
        const user = await User.findOne({email: req.body.email});  
        if (user) {
            return res.send({msg: "User is not found", status: false});
        }      
        const hash = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, hash);
        const newUser = new User({email: req.body.email, password: hashedPassword, username: req.body.name});
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
            return res.send({msg: "User is already exists", status: false});
        }   
        const passwordControl = await bcrypt.compare(req.body.password, (user.password as string));
        if (!passwordControl) {
            return res.send({msg: "Password is incorrect", status:false});
        }

        const token = jwt.sign({userId: user._id}, process.env.PRIVATE_KEY!);
        await redis.set(`loginlist:${token}`, user._id.toString(), "EX", 60*20);
        
        return res.send({token, status: true});
    } catch (error) {
        console.log(error);
        return false;
    }
};
