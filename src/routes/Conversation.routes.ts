import express from "express";
import { getConversationById, newConversation } from "../controllers/Conversation.controller";
import tokenControlForFunction from "../middleware/tokenControl";

const router = express.Router();

router.get("/:id", tokenControlForFunction, getConversationById);
router.post("/add", newConversation);

export default router;