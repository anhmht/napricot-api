"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get createUser () {
        return createUser;
    },
    get getMe () {
        return getMe;
    },
    get getUsers () {
        return getUsers;
    },
    get resendVerificationCode () {
        return resendVerificationCode;
    },
    get resetPassword () {
        return resetPassword;
    },
    get sendResetPasswordLink () {
        return sendResetPasswordLink;
    },
    get verifyUser () {
        return verifyUser;
    }
});
const _User = /*#__PURE__*/ _interop_require_default(require("../schema/User"));
const _utils = require("../utils");
const _password = require("../utils/password");
const _email = require("../utils/email");
const _nodeverificationcode = require("node-verification-code");
const _jsonwebtoken = /*#__PURE__*/ _interop_require_default(require("jsonwebtoken"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const createUser = async (req, res, next)=>{
    try {
        const { name, email, password } = req.body;
        const missingField = (0, _utils.getMissingFields)(req.body, [
            'name',
            'email',
            'password'
        ]);
        if (missingField) {
            res.status(400).json({
                error: true,
                field: missingField,
                message: `${missingField} is required`
            });
            return next(new Error('missing required field'));
        }
        // check if user already exists
        const isUserExists = await _User.default.findOne({
            email
        });
        if (isUserExists) {
            res.status(404).json({
                error: true,
                message: 'User already exists'
            });
            return next(new Error('User already exists'));
        }
        const verificationCode = (0, _nodeverificationcode.getDigitalCode)(6).toString();
        const user = await _User.default.create({
            name,
            email,
            password: await (0, _password.hashPassword)(password),
            verifyCode: await (0, _password.hashPassword)(verificationCode)
        });
        let token;
        try {
            //Creating jwt token
            token = _jsonwebtoken.default.sign({
                userId: user._id,
                email: user.email,
                roles: user.roles,
                password: user.password
            }, process.env.JWT_SECRET, {
                expiresIn: '10 years'
            });
        } catch (err) {
            const error = new Error('Error! Something went wrong.');
            res.status(500).json({
                message: 'Error! Something went wrong.',
                err
            });
            return next(error);
        }
        (0, _email.sendMail)({
            from: 'Napricot <support@napricot.com>',
            emails: [
                email
            ],
            subject: 'Verify your Napricot account',
            template: 'email-verification.html',
            params: [
                {
                    key: 'name',
                    value: name
                },
                {
                    key: 'code',
                    value: verificationCode
                },
                {
                    key: 'link',
                    value: `${process.env.FRONTEND_URL}/email-verification?token=${token}`
                }
            ]
        });
        res.status(200).json({
            userId: user._id,
            name: user.name,
            email: user.email,
            roles: user.roles,
            token
        });
    } catch (error) {
        return next(error);
    }
};
const resendVerificationCode = async (req, res, next)=>{
    try {
        const { email } = req.body;
        const missingField = (0, _utils.getMissingFields)(req.body, [
            'email'
        ]);
        if (missingField) {
            res.status(400).json({
                error: true,
                field: missingField,
                message: `${missingField} is required`
            });
            return next(new Error('missing required field'));
        }
        // check if user already exists
        const user = await _User.default.findOne({
            email
        });
        if (!user) {
            res.status(404).json({
                error: true,
                message: 'User does not exists'
            });
            return next(new Error('User does not exists'));
        }
        const verificationCode = (0, _nodeverificationcode.getDigitalCode)(6).toString();
        await _User.default.findByIdAndUpdate(user._id, {
            verifyCode: await (0, _password.hashPassword)(verificationCode)
        }, {
            new: true
        });
        (0, _email.sendMail)({
            from: 'Napricot <support@napricot.com>',
            emails: [
                email
            ],
            subject: 'Verify your Napricot account',
            template: 'email-verification.html',
            params: [
                {
                    key: 'name',
                    value: user.name
                },
                {
                    key: 'code',
                    value: verificationCode
                }
            ]
        });
        res.status(200).json({
            message: 'Verification code sent successfully'
        });
    } catch (error) {
        return next(error);
    }
};
const verifyUser = async (req, res, next)=>{
    try {
        const { email, code } = req.body;
        const missingField = (0, _utils.getMissingFields)(req.body, [
            'email',
            'code'
        ]);
        if (missingField) {
            res.status(400).json({
                error: true,
                field: missingField,
                message: `${missingField} is required`
            });
            return next(new Error('missing required field'));
        }
        const user = await _User.default.findOne({
            email
        });
        if (!user) {
            res.status(404).json({
                error: true,
                message: 'User does not exists'
            });
            return next(new Error('User does not exists'));
        }
        const isCodeMatch = await (0, _password.comparePassword)(code, user.verifyCode || '');
        if (!isCodeMatch) {
            res.status(400).json({
                error: true,
                message: 'Invalid verification code'
            });
            return next(new Error('Invalid verification code'));
        }
        await _User.default.findByIdAndUpdate(user._id, {
            isVerified: true
        }, {
            new: true
        });
        res.status(200).json({
            message: 'User verified successfully'
        });
    } catch (error) {
        return next(error);
    }
};
const getMe = async (req, res, next)=>{
    try {
        res.status(200).json({
            ...res.locals.user
        });
    } catch (error) {
        return next(error);
    }
};
const getUsers = async (req, res, next)=>{
    try {
        const a = new Date();
        const users = await _User.default.find();
        const b = new Date();
        console.log('Time taken to get users:', b.getTime() - a.getTime());
        res.status(200).json({
            users
        });
    } catch (error) {
        return next(error);
    }
};
const sendResetPasswordLink = async (req, res, next)=>{
    try {
        const { email } = req.body;
        const missingField = (0, _utils.getMissingFields)(req.body, [
            'email'
        ]);
        if (missingField) {
            res.status(400).json({
                error: true,
                field: missingField,
                message: `${missingField} is required`
            });
            return next(new Error('missing required field'));
        }
        const user = await _User.default.findOne({
            email
        });
        if (!user) {
            res.status(404).json({
                error: true,
                message: 'User does not exists'
            });
            return next(new Error('User does not exists'));
        }
        let token;
        try {
            //Creating jwt token
            token = _jsonwebtoken.default.sign({
                userId: user._id,
                email: user.email,
                roles: user.roles,
                password: user.password
            }, process.env.JWT_SECRET, {
                expiresIn: '10 years'
            });
        } catch (err) {
            const error = new Error('Error! Something went wrong.');
            res.status(500).json({
                message: 'Error! Something went wrong.',
                err
            });
            return next(error);
        }
        (0, _email.sendMail)({
            from: 'Napricot <support@napricot.com>',
            emails: [
                email
            ],
            subject: 'Reset your Napricot account password',
            template: 'reset-password.html',
            params: [
                {
                    key: 'name',
                    value: user.name
                },
                {
                    key: 'link',
                    value: `${process.env.FRONTEND_URL}/reset-password?token=${token}`
                }
            ]
        });
        res.status(200).json({
            message: 'Reset code sent successfully'
        });
    } catch (error) {
        return next(error);
    }
};
const resetPassword = async (req, res, next)=>{
    try {
        const { password } = req.body;
        const missingField = (0, _utils.getMissingFields)(req.body, [
            'password'
        ]);
        if (missingField) {
            res.status(400).json({
                error: true,
                field: missingField,
                message: `${missingField} is required`
            });
            return next(new Error('missing required field'));
        }
        const token = req.header('Authorization');
        if (!token) {
            res.status(400).json({
                error: true,
                message: 'Token is required'
            });
            return next(new Error('Token is required'));
        }
        _jsonwebtoken.default.verify(token.split(' ')[1], process.env.JWT_SECRET, async (err, decoded)=>{
            if (err) {
                res.status(403).json({
                    error: true,
                    message: 'Forbidden'
                });
                return next(new Error('Forbidden'));
            }
            const user = await _User.default.findById(decoded.userId);
            if (!user) {
                res.status(404).json({
                    error: true,
                    message: 'User does not exists'
                });
                return next(new Error('User does not exists'));
            }
            if (user.password !== decoded.password) {
                res.status(400).json({
                    error: true,
                    message: 'Invalid token'
                });
                return next(new Error('Invalid token'));
            }
            await _User.default.findByIdAndUpdate(user._id, {
                password: await (0, _password.hashPassword)(password)
            }, {
                new: true
            });
            res.status(200).json({
                message: 'Password reset successfully'
            });
        });
    } catch (error) {
        return next(error);
    }
};

//# sourceMappingURL=user.js.map