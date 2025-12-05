import jwt from 'jsonwebtoken';
import { Response } from "express";
import { AuthRequest } from "../middleware/tokenControl";
import { io } from '..';

const qrCodeApprove = (req: AuthRequest, res: Response) =>{
    try {
        const user = req.user;
        if (!user || req.body.qrCodeId) {
            return res.send({status: false, msg: ""});
        }

        const token = jwt.sign({userId: user._id}, process.env.PRIVATE_KEY!+"asdasdax", {expiresIn: "7d"});
        io.to(req.body.qrCodeId).emit("qr_login_success", {
            token: token,
            user: user
        });

        return res.json({status: true, msg: "Sended enter Verify"});

    } catch (error) {
        console.log(error);
        return res.send({status: false, msg: ""});
    }
};

export default qrCodeApprove;