"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const fs_1 = __importDefault(require("fs"));
const transporter = nodemailer_1.default.createTransport({
    // config mail server
    host: 'smtp.gmail.com',
    port: 587,
    ignoreTLS: false,
    secure: false,
    auth: {
        user: process.env.GOOGLE_EMAIL,
        pass: process.env.GOOGLE_APP_PASSWORD
    },
    tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false
    }
});
const mainOptions = {};
const sendMail = async (mail) => {
    try {
        mainOptions.from = mail.from;
        mainOptions.subject = mail.subject;
        mainOptions.to = mail.emails;
        let html = fs_1.default
            .readFileSync(`./src/email-template/${mail.template}`, 'utf8')
            .toString()
            .trim();
        mail.params.forEach((element) => {
            html = html.replace(new RegExp(`\\{${element.key}\\}`, 'g'), element.value);
        });
        mainOptions.html = html;
        transporter.sendMail(mainOptions, function (err, info) {
            if (err) {
                console.log(err);
            }
        });
    }
    catch (error) {
        console.log(error);
    }
};
exports.sendMail = sendMail;
