"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureCors = configureCors;
/**
 * CORS Configuration
 * Sets up the CORS middleware for the application
 */
const cors_1 = __importDefault(require("cors"));
const env_1 = require("../config/env");
/**
 * Configures and returns the CORS middleware
 */
function configureCors() {
    const corsOptions = {
        origin: (origin, callback) => {
            if (env_1.config.whitelist.indexOf(origin ?? '') !== -1 || !origin) {
                callback(null, true);
            }
            else {
                callback(new Error('Not allowed by CORS'));
            }
        }
    };
    return (0, cors_1.default)(corsOptions);
}
