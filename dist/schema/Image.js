"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const imageSchema = new mongoose_1.default.Schema({
    path: {
        type: String,
        required: [true, 'path is required']
    },
    url: {
        type: String,
        required: [true, 'url is required']
    },
    thumbnailPath: {
        type: String
    },
    thumbnailUrl: {
        type: String
    },
    cloudflareUrl: {
        type: String
    }
}, {
    timestamps: true
});
exports.default = mongoose_1.default.model('images', imageSchema, 'images');
