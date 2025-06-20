"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.sendResetPasswordLink = exports.getMe = exports.verifyUser = exports.resendVerificationCode = exports.getUsers = exports.createUser = void 0;
const User_1 = __importDefault(require("../schema/User"));
const utils_1 = require("../utils");
const password_1 = require("../utils/password");
const email_1 = require("../utils/email");
const node_verification_code_1 = require("node-verification-code");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const createUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const missingField = (0, utils_1.getMissingFields)(req.body, [
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
        const isUserExists = await User_1.default.findOne({ email });
        if (isUserExists) {
            res.status(404).json({
                error: true,
                message: 'User already exists'
            });
            return next(new Error('User already exists'));
        }
        const verificationCode = (0, node_verification_code_1.getDigitalCode)(6).toString();
        const user = await User_1.default.create({
            name,
            email,
            password: await (0, password_1.hashPassword)(password),
            verifyCode: await (0, password_1.hashPassword)(verificationCode)
        });
        let token;
        try {
            //Creating jwt token
            token = jsonwebtoken_1.default.sign({
                userId: user._id,
                email: user.email,
                roles: user.roles,
                password: user.password
            }, process.env.JWT_SECRET, { expiresIn: '10 years' });
        }
        catch (err) {
            const error = new Error('Error! Something went wrong.');
            res.status(500).json({
                message: 'Error! Something went wrong.',
                err
            });
            return next(error);
        }
        (0, email_1.sendMail)({
            from: 'Napricot <support@napricot.com>',
            emails: [email],
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
    }
    catch (error) {
        return next(error);
    }
};
exports.createUser = createUser;
const resendVerificationCode = async (req, res, next) => {
    try {
        const { email } = req.body;
        const missingField = (0, utils_1.getMissingFields)(req.body, ['email']);
        if (missingField) {
            res.status(400).json({
                error: true,
                field: missingField,
                message: `${missingField} is required`
            });
            return next(new Error('missing required field'));
        }
        // check if user already exists
        const user = await User_1.default.findOne({ email });
        if (!user) {
            res.status(404).json({
                error: true,
                message: 'User does not exists'
            });
            return next(new Error('User does not exists'));
        }
        const verificationCode = (0, node_verification_code_1.getDigitalCode)(6).toString();
        await User_1.default.findByIdAndUpdate(user._id, {
            verifyCode: await (0, password_1.hashPassword)(verificationCode)
        }, { new: true });
        (0, email_1.sendMail)({
            from: 'Napricot <support@napricot.com>',
            emails: [email],
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
    }
    catch (error) {
        return next(error);
    }
};
exports.resendVerificationCode = resendVerificationCode;
const verifyUser = async (req, res, next) => {
    try {
        const { email, code } = req.body;
        const missingField = (0, utils_1.getMissingFields)(req.body, ['email', 'code']);
        if (missingField) {
            res.status(400).json({
                error: true,
                field: missingField,
                message: `${missingField} is required`
            });
            return next(new Error('missing required field'));
        }
        const user = await User_1.default.findOne({ email });
        if (!user) {
            res.status(404).json({
                error: true,
                message: 'User does not exists'
            });
            return next(new Error('User does not exists'));
        }
        const isCodeMatch = await (0, password_1.comparePassword)(code, user.verifyCode || '');
        if (!isCodeMatch) {
            res.status(400).json({
                error: true,
                message: 'Invalid verification code'
            });
            return next(new Error('Invalid verification code'));
        }
        await User_1.default.findByIdAndUpdate(user._id, {
            isVerified: true
        }, { new: true });
        res.status(200).json({
            message: 'User verified successfully'
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.verifyUser = verifyUser;
const getMe = async (req, res, next) => {
    try {
        res.status(200).json({
            ...res.locals.user
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.getMe = getMe;
const getUsers = async (req, res, next) => {
    try {
        const a = new Date();
        const users = await User_1.default.find();
        const b = new Date();
        console.log('Time taken to get users:', b.getTime() - a.getTime());
        res.status(200).json({
            users
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.getUsers = getUsers;
const sendResetPasswordLink = async (req, res, next) => {
    try {
        const { email } = req.body;
        const missingField = (0, utils_1.getMissingFields)(req.body, ['email']);
        if (missingField) {
            res.status(400).json({
                error: true,
                field: missingField,
                message: `${missingField} is required`
            });
            return next(new Error('missing required field'));
        }
        const user = await User_1.default.findOne({ email });
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
            token = jsonwebtoken_1.default.sign({
                userId: user._id,
                email: user.email,
                roles: user.roles,
                password: user.password
            }, process.env.JWT_SECRET, { expiresIn: '10 years' });
        }
        catch (err) {
            const error = new Error('Error! Something went wrong.');
            res.status(500).json({
                message: 'Error! Something went wrong.',
                err
            });
            return next(error);
        }
        (0, email_1.sendMail)({
            from: 'Napricot <support@napricot.com>',
            emails: [email],
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
    }
    catch (error) {
        return next(error);
    }
};
exports.sendResetPasswordLink = sendResetPasswordLink;
const resetPassword = async (req, res, next) => {
    try {
        const { password } = req.body;
        const missingField = (0, utils_1.getMissingFields)(req.body, ['password']);
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
        jsonwebtoken_1.default.verify(token.split(' ')[1], process.env.JWT_SECRET, async (err, decoded) => {
            if (err) {
                res.status(403).json({
                    error: true,
                    message: 'Forbidden'
                });
                return next(new Error('Forbidden'));
            }
            const user = await User_1.default.findById(decoded.userId);
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
            await User_1.default.findByIdAndUpdate(user._id, {
                password: await (0, password_1.hashPassword)(password)
            }, { new: true });
            res.status(200).json({
                message: 'Password reset successfully'
            });
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.resetPassword = resetPassword;
