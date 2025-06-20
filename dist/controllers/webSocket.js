"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcast = exports.notificationType = void 0;
const axios_1 = __importDefault(require("axios"));
exports.notificationType = {
    POST: 'postNotification'
};
const broadcast = async (data) => {
    try {
        // Deploy master branch
        await axios_1.default.post(`${process.env.OPERATION_URL}/websocket/send`, {
            message: {
                ...data
            }
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
    catch (error) {
        console.log(error);
    }
};
exports.broadcast = broadcast;
