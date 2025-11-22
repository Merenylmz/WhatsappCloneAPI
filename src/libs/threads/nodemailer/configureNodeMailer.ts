import nodemailer from 'nodemailer';
import {parentPort} from "worker_threads";


parentPort?.on("message", async(msg)=>{
    try {
        let transporter = nodemailer.createTransport({
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
            text: msg.body
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        parentPort?.postMessage("Mail Error");
    }
})
// export async function sendMail({ to, subject, body }: {to: any, subject: any, body: any}) {
// }