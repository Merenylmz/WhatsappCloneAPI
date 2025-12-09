import { NextFunction, Request, Response } from "express";
import tokenControlFunction from "./commonControl";

export interface AuthRequest extends Request{
    user?: any
}

const normalTokenControl = async(req: AuthRequest, res: Response, next: NextFunction) =>{
    const token = req.query.token as string;
    const {user} = await tokenControlFunction(token);
    req.user = user;
    next();
};



export default normalTokenControl;