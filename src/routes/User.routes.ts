import express from "express";
import { findUser, forgotPassword, login, newPassword, register } from "../controllers/User.controller";
import normalTokenControl from "../middleware/tokenControl";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/forgotpassword", forgotPassword);
router.post("/newpassword", newPassword);
router.get("/search", normalTokenControl, findUser);

export default router;