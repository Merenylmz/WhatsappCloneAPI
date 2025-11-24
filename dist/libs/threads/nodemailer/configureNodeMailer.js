"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const worker_threads_1 = require("worker_threads");
worker_threads_1.parentPort?.on("message", async (msg) => {
    try {
        let transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: msg.to,
            subject: msg.subject,
            html: msg.body
        };
        await transporter.sendMail(mailOptions);
    }
    catch (error) {
        worker_threads_1.parentPort?.postMessage("Mail Error");
    }
});
// export async function sendMail({ to, subject, body }: {to: any, subject: any, body: any}) {
// }
