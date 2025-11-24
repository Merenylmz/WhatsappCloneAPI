"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMailThread = void 0;
const path_1 = __importDefault(require("path"));
const worker_threads_1 = require("worker_threads");
const runMailThread = (payload) => {
    return new Promise((resolve, reject) => {
        const worker = new worker_threads_1.Worker(path_1.default.resolve(__dirname, "./../../../dist/libs/threads/nodemailer/configureNodeMailer.js"));
        worker.postMessage(payload);
        worker.on("message", (msg) => {
            resolve(msg);
        });
        worker.on("error", reject);
        worker.on("exit", (code) => {
            if (code !== 0)
                reject(new Error(`Worker exited with code ${code}`));
        });
    });
};
exports.runMailThread = runMailThread;
