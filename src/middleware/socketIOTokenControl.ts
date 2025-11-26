import { AuthenticatedSocket } from "../Types/Types";
import tokenControlFunction from "./commonControl";

const tokenControl = async(socket: AuthenticatedSocket, next: (err?: Error) => void) => {
    try {
        const token = socket.handshake.query.token as string;
        const {user} = await tokenControlFunction(token) as {user: any}; 

        socket.userId = user._id;
        next();
    } catch (error) {
        return next(new Error('Authentication error: Token is not invalid'));
    }
}

export default tokenControl;