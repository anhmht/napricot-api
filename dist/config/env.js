"use strict";
/**
 * Environment configuration
 * Centralizes all environment-related settings
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
// Debug: Log the raw PORT environment variable
console.log('Raw PORT environment variable:', process.env.PORT);
// Parse and provide environment variables with defaults
exports.config = {
    port: parseInt(process.env.PORT ?? '8080', 10),
    nodeEnv: process.env.NODE_ENV ?? 'development',
    whitelist: process.env.WHITELIST_DOMAIN?.split(',') ?? [],
    isProduction: process.env.NODE_ENV === 'production'
};
// Debug: Log the parsed port value
console.log('Parsed PORT value:', exports.config.port);
