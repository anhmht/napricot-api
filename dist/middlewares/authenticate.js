"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "authenticateJWT", {
    enumerable: true,
    get: function() {
        return authenticateJWT;
    }
});
const _jsonwebtoken = /*#__PURE__*/ _interop_require_default(require("jsonwebtoken"));
const _User = /*#__PURE__*/ _interop_require_default(require("../schema/User"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const authenticateJWT = (req, res, next)=>{
    const token = req.header('Authorization');
    if (!token) {
        res.status(401).json({
            error: 'Unauthorized'
        });
        return;
    }
    _jsonwebtoken.default.verify(token.split(' ')[1], process.env.JWT_SECRET, async (err, decoded)=>{
        if (err) {
            res.status(403).json({
                error: 'Forbidden'
            });
            return;
        }
        const info = decoded;
        const user = await _User.default.findOne({
            email: info.email
        });
        if (!user) {
            res.status(404).json({
                error: 'User not found'
            });
            return;
        }
        if (user.password !== info.password) {
            res.status(403).json({
                error: 'Forbidden'
            });
            return;
        }
        res.locals.user = {
            userId: user._id,
            email: user.email,
            roles: user.roles,
            name: user.name,
            isVerified: user.isVerified
        };
        next();
    });
};

//# sourceMappingURL=authenticate.js.map