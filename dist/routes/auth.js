"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// Import from the TypeScript version
const auth_1 = require("../controllers/auth");
const router = express_1.default.Router();
// login
router.post('/login', auth_1.login);
exports.default = router;
