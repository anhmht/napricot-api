/**
 * Logger utility for consistent logging throughout the application
 * Replaces direct console.log calls for better control in production environments
 */ // Environment-aware logger
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get default () {
        return _default;
    },
    get logger () {
        return logger;
    }
});
const isDevelopment = process.env.NODE_ENV === 'development';
const logger = {
    info: (message, ...args)=>{
        if (isDevelopment || process.env.LOG_LEVEL === 'info') {
            console.info(`[INFO] ${message}`, ...args);
        }
    },
    error: (message, error)=>{
        console.error(`[ERROR] ${message}`, error);
    },
    debug: (message, ...args)=>{
        if (isDevelopment || process.env.LOG_LEVEL === 'debug') {
            console.debug(`[DEBUG] ${message}`, ...args);
        }
    },
    warn: (message, ...args)=>{
        console.warn(`[WARN] ${message}`, ...args);
    }
};
const _default = logger;

//# sourceMappingURL=logger.js.map