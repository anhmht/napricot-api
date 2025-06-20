"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServer = createServer;
exports.startServer = startServer;
/**
 * Server Factory
 * Creates the appropriate server (HTTP or HTTPS) based on environment
 */
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const env_1 = require("../config/env");
/**
 * Creates either an HTTP or HTTPS server based on environment and available credentials
 * @param app Express application
 * @param sslCredentials SSL credentials (if available)
 * @returns HTTP or HTTPS server
 */
function createServer(app, sslCredentials) {
    // Use HTTPS server in development with valid credentials
    if (!env_1.config.isProduction && sslCredentials) {
        const server = https_1.default.createServer(sslCredentials, app);
        return server;
    }
    // Otherwise use HTTP server (for production or if SSL certs are missing)
    return http_1.default.createServer(app);
}
/**
 * Starts the server on the configured port
 * @param server HTTP or HTTPS server
 * @returns The server instance
 */
function startServer(server) {
    server.listen(env_1.config.port, () => {
        const protocol = server instanceof https_1.default.Server ? 'HTTPS' : 'HTTP';
        console.log(`Server started listening on ${env_1.config.port} in ${env_1.config.nodeEnv} mode (${protocol})`);
        // Signal to PM2 that server is ready
        if (process.send) {
            process.send('ready');
        }
    });
    return server;
}
