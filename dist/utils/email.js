"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "sendMail", {
    enumerable: true,
    get: function() {
        return sendMail;
    }
});
const _nodemailer = /*#__PURE__*/ _interop_require_default(require("nodemailer"));
const _fs = /*#__PURE__*/ _interop_require_default(require("fs"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const transporter = _nodemailer.default.createTransport({
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
const sendMail = async (mail)=>{
    try {
        mainOptions.from = mail.from;
        mainOptions.subject = mail.subject;
        mainOptions.to = mail.emails;
        let html = _fs.default.readFileSync(`./src/email-template/${mail.template}`, 'utf8').toString().trim();
        mail.params.forEach((element)=>{
            html = html.replace(new RegExp(`\\{${element.key}\\}`, 'g'), element.value);
        });
        mainOptions.html = html;
        transporter.sendMail(mainOptions, function(err, info) {
            if (err) {
                console.log(err);
            }
        });
    } catch (error) {
        console.log(error);
    }
};

//# sourceMappingURL=email.js.map