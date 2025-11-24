import express from "express";
import { forgotPassword, login, newPassword, register } from "../controllers/User.controller";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/forgotpassword", forgotPassword);
router.post("/newpassword", newPassword);

export default router;