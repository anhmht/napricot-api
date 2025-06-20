"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// Import controllers
const user_1 = require("../controllers/user");
// Import middleware
const authenticate_1 = require("../middlewares/authenticate");
const router = express_1.default.Router();
// create a user
router.post('/register', user_1.createUser);
// resend verification code
router.post('/resend', user_1.resendVerificationCode);
// verify user
router.post('/verify', user_1.verifyUser);
// get all users
router.get('/', authenticate_1.authenticateJWT, user_1.getUsers);
// get me
router.get('/me', authenticate_1.authenticateJWT, user_1.getMe);
// send reset password email
router.post('/send-reset-password-link', user_1.sendResetPasswordLink);
// reset password
router.post('/reset-password', user_1.resetPassword);
// Commented routes
// router.get('/:id', getUser)
// router.put('/:id', updateUser)
// router.delete('/:id', deleteUser)
exports.default = router;
