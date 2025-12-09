import express from "express";
import { getConversationById, getConversations, newConversation } from "../controllers/Conversation.controller";
import normalTokenControl from "../middleware/tokenControl";

const router = express.Router();

router.get("/", normalTokenControl, getConversations);
router.get("/:id", normalTokenControl, getConversationById);
router.post("/add", newConversation);

export default router;