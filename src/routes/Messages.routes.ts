import express from "express";
import { getMessages } from "../controllers/Message.controller";
import tokenControlForFunction from "../middleware/tokenControl";
const router = express.Router();


router.get("/", getMessages);

export default router;