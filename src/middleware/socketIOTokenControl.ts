import { AuthenticatedSocket } from "../Types/Types";
import jwt from "jsonwebtoken";

const tokenControl = (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
    const token = socket.handshake.query.token as string;
    // if (!token) {
    //     return next(new Error("Autheticated Error: Token is not found"));
    // }    
    console.log(token);
    try {
        const payload = jwt.verify(token, process.env.PRIVATE_KEY!) as {userId: any};
        socket.userId = payload.userId;
        next();
    } catch (error) {
        return next(new Error('Authentication error: Token is not invalid'));
    }
}

export default tokenControl;