"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "login", {
    enumerable: true,
    get: function() {
        return login;
    }
});
const _jsonwebtoken = /*#__PURE__*/ _interop_require_default(require("jsonwebtoken"));
const _password = require("../utils/password");
const _User = /*#__PURE__*/ _interop_require_default(require("../schema/User"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const login = async (req, res, next)=>{
    const { email, password } = req.body;
    try {
        const existingUser = await _User.default.findOne({
            email
        });
        if (!existingUser) {
            res.status(404).json({
                message: 'Invalid email or password'
            });
            return next(new Error('Invalid email or password'));
        }
        const isPasswordMatch = await (0, _password.comparePassword)(password, existingUser.password);
        if (!isPasswordMatch) {
            res.status(404).json({
                message: 'Invalid email or password'
            });
            return next(new Error('Invalid email or password'));
        }
        let token;
        try {
            // Creating jwt token
            token = _jsonwebtoken.default.sign({
                userId: existingUser._id,
                email: existingUser.email,
                roles: existingUser.roles,
                password: existingUser.password
            }, process.env.JWT_SECRET, {
                expiresIn: '10 years',
                algorithm: 'HS256'
            });
        } catch (err) {
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
    } catch (err) {
        res.status(500).json({
            message: 'Error! Something went wrong.',
            err
        });
        return next(err);
    }
};

//# sourceMappingURL=auth.js.map