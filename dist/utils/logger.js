"use strict";
/**
 * Logger utility for consistent logging throughout the application
 * Replaces direct console.log calls for better control in production environments
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
// Environment-aware logger
const isDevelopment = process.env.NODE_ENV === 'development';
exports.logger = {
    info: (message, ...args) => {
        if (isDevelopment || process.env.LOG_LEVEL === 'info') {
            console.info(`[INFO] ${message}`, ...args);
        }
    },
    error: (message, error) => {
        console.error(`[ERROR] ${message}`, error);
    },
    debug: (message, ...args) => {
        if (isDevelopment || process.env.LOG_LEVEL === 'debug') {
            console.debug(`[DEBUG] ${message}`, ...args);
        }
    },
    warn: (message, ...args) => {
        console.warn(`[WARN] ${message}`, ...args);
    }
};
exports.default = exports.logger;
