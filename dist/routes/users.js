"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, // Commented routes
// router.get('/:id', getUser)
// router.put('/:id', updateUser)
// router.delete('/:id', deleteUser)
"default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _express = /*#__PURE__*/ _interop_require_default(require("express"));
const _user = require("../controllers/user");
const _authenticate = require("../middlewares/authenticate");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const router = _express.default.Router();
// create a user
router.post('/register', _user.createUser);
// resend verification code
router.post('/resend', _user.resendVerificationCode);
// verify user
router.post('/verify', _user.verifyUser);
// get all users
router.get('/', _authenticate.authenticateJWT, _user.getUsers);
// get me
router.get('/me', _authenticate.authenticateJWT, _user.getMe);
// send reset password email
router.post('/send-reset-password-link', _user.sendResetPasswordLink);
// reset password
router.post('/reset-password', _user.resetPassword);
const _default = router;

//# sourceMappingURL=users.js.map