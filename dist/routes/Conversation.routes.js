"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Conversation_controller_1 = require("../controllers/Conversation.controller");
const tokenControl_1 = __importDefault(require("../middleware/tokenControl"));
const router = express_1.default.Router();
router.get("/:id", tokenControl_1.default, Conversation_controller_1.getConversationById);
router.post("/add", Conversation_controller_1.newConversation);
exports.default = router;
