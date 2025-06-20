"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// Import from the TypeScript version
const email_1 = require("../controllers/email");
const router = express_1.default.Router();
// sendMail
router.post('/send', email_1.sendMail);
exports.default = router;
