import mongoose from "mongoose";
import { Socket } from "socket.io";

type UserType = {
    _id?: any;
    username: String;
    email: String;
    password: String;
    avatar?: String
    conversations: any
    online?: Boolean
    lastSeen?: String,
    lastLoginToken?: String,
    QRCodeURI?: String,
    QRCodeToken?: String,
    forgotPasswordToken?: String,
    accessCode: String 
};

type MessageType = {
    _id?: any;
    sender: any;
    conversation: any;
    content: String;
    contentType?: String;
    readBy?: Boolean;
};

type ConversationType = {
    _id?: any;
    participants: Array<any>;
    isGroup?: Boolean;
    groupName?: String;
    groupAdmin: any;
    lastMessage: any;
};

interface AuthenticatedSocket extends Socket {
  userId?: string;
}


export {UserType, MessageType, ConversationType, AuthenticatedSocket};