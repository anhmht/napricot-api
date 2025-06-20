"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// Import controller
const urlPreview_1 = require("../controllers/urlPreview");
const router = express_1.default.Router();
// Get URL preview
router.get('/get-preview-link', urlPreview_1.getUrlPreview);
exports.default = router;
