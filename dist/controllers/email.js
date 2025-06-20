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
const mainOptions = {
    from: 'Napricot <support@napricot.com>',
    subject: 'Test Send Mail Nodejs',
    html: fs_1.default
        .readFileSync('./src/email-template/order-success.html', 'utf8')
        .toString()
        .trim()
        .replace('{name}', 'Tri Anh')
};
const sendMail = async (req, res, next) => {
    try {
        mainOptions.to = req.body.emails;
        transporter.sendMail(mainOptions, function (err, info) {
            if (err) {
                return next(err);
            }
            else {
                res.status(200).json({
                    message: 'Success',
                    info
                });
            }
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.sendMail = sendMail;
