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
    html: _fs.default.readFileSync('./src/email-template/order-success.html', 'utf8').toString().trim().replace('{name}', 'Tri Anh')
};
const sendMail = async (req, res, next)=>{
    try {
        mainOptions.to = req.body.emails;
        transporter.sendMail(mainOptions, function(err, info) {
            if (err) {
                return next(err);
            } else {
                res.status(200).json({
                    message: 'Success',
                    info
                });
            }
        });
    } catch (error) {
        return next(error);
    }
};

//# sourceMappingURL=email.js.map