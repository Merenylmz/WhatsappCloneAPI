import path from "path";
import { Worker } from "worker_threads";

export const runMailThread = (payload: any) =>{
    return new Promise((resolve, reject)=>{
        const worker = new Worker(path.resolve(__dirname, "./../../../dist/libs/threads/nodemailer/configureNodeMailer.js"));
        worker.postMessage(payload);
        worker.on("message", (msg) => {
            resolve(msg);
        });

        worker.on("error", reject);
        worker.on("exit", (code) => {
            if (code !== 0) reject(new Error(`Worker exited with code ${code}`));
        });
    });
}