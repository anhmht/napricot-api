"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// Import controller
const stripe_1 = require("../controllers/stripe");
const router = express_1.default.Router();
// Handle Stripe webhook
router.post('/webhook', express_1.default.raw({ type: 'application/json' }), stripe_1.handleWebhook);
exports.default = router;
