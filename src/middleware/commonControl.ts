import jwt from 'jsonwebtoken';
import User from "../models/User.model";
import redis from '../libs/redis/redisConf';

const tokenControlFunction = async(token: any)=>{
    if (!token) {
        return {status: false, msg: "Token is not found"};
    }
    const decodedToken = await jwt.verify(token, process.env.PRIVATE_KEY!) as {userId: any};
    const user = await User.findOne({_id: decodedToken.userId});
    if (!user) {
        return {status: false, msg: "User is not found"};
    }
    const redisToken = await redis.get(`loginlist:${token}`); 
    if (token != user.lastLoginToken) {
        return {status: false, msg: "Token is not valid"};
    }
    if (user.lastLoginToken != redisToken) {
        return {status: false, msg: "Token is Expired"};
    }

    return {user, status: true, msg: "Control Finished"};
}

export default tokenControlFunction;
 