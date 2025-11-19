import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.model";
import redis from "../libs/redis/redisConf";

export interface AuthRequest extends Request{
    user?: any
}

const tokenControlForFunction = async(req: AuthRequest, res: Response, next: NextFunction) =>{
    const token = req.query.token as string;
    console.log(token);
    if (!token) {
        return res.send({status: false, msg: "Token is not found"});
    }
    const decodedToken = await jwt.verify(token, process.env.PRIVATE_KEY!) as {userId: any};
    const user = await User.findOne({_id: decodedToken.userId});
    if (!user) {
        return res.send({status: false, msg: "User is not found"});
    }
    const redisToken = await redis.get(`loginlist:${token}`); 
    if (token != user.lastLoginToken) {
        return res.send({status: false, msg: "Token is not valid"});
    }
    if (user.lastLoginToken != redisToken) {
        return res.send({status: false, msg: "Token is Expired"});
    }
    
    req.user = user;
    next();
};

export default tokenControlForFunction;