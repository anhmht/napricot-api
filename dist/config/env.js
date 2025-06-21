/**
 * Environment configuration
 * Centralizes all environment-related settings
 */ // Debug: Log the raw PORT environment variable
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "config", {
    enumerable: true,
    get: function() {
        return config;
    }
});
console.log('Raw PORT environment variable:', process.env.PORT);
const config = {
    port: parseInt(process.env.PORT ?? '8080', 10),
    nodeEnv: process.env.NODE_ENV ?? 'development',
    whitelist: process.env.WHITELIST_DOMAIN?.split(',') ?? [],
    isProduction: process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging'
};
// Debug: Log the parsed port value
console.log('Parsed PORT value:', config.port);

//# sourceMappingURL=env.js.map