import { AuthenticatedSocket } from "../Types/Types";
import tokenControlFunction from "./commonControl";

const tokenControl = async(socket: AuthenticatedSocket, next: (err?: Error) => void) => {
    try {
        const token = socket.handshake.query.token as string;
        const data = await tokenControlFunction(token) as any; 
        if (!data.status) {
            return next(new Error(data.msg))
        }
        
        
        socket.userId = data.user._id;
        next();
    } catch (error) {
        console.log(error);
        
        return next(new Error('Authentication error: Token is invalid'));
    }
}

export default tokenControl;