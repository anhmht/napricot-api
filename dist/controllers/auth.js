"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const password_1 = require("../utils/password");
const User_1 = __importDefault(require("../schema/User"));
const login = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const existingUser = await User_1.default.findOne({ email });
        if (!existingUser) {
            res.status(404).json({
                message: 'Invalid email or password'
            });
            return next(new Error('Invalid email or password'));
        }
        const isPasswordMatch = await (0, password_1.comparePassword)(password, existingUser.password);
        if (!isPasswordMatch) {
            res.status(404).json({
                message: 'Invalid email or password'
            });
            return next(new Error('Invalid email or password'));
        }
        let token;
        try {
            // Creating jwt token
            token = jsonwebtoken_1.default.sign({
                userId: existingUser._id,
                email: existingUser.email,
                roles: existingUser.roles,
                password: existingUser.password
            }, process.env.JWT_SECRET, {
                expiresIn: '10 years',
                algorithm: 'HS256'
            });
        }
        catch (err) {
            const error = new Error('Error! Something went wrong.');
            res.status(500).json({
                message: 'Error! Something went wrong.',
                err
            });
            return next(error);
        }
        res.status(200).json({
            user: {
                userId: existingUser.id,
                email: existingUser.email,
                name: existingUser.name,
                roles: existingUser.roles,
                token: token
            }
        });
    }
    catch (err) {
        res.status(500).json({
            message: 'Error! Something went wrong.',
            err
        });
        return next(err);
    }
};
exports.login = login;
