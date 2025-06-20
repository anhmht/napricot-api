"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Import the configured Express application
const app_1 = __importDefault(require("./app"));
const db_1 = __importDefault(require("./config/db"));
const script_1 = __importDefault(require("./pm2/script"));
const server_1 = require("./server/server");
const ssl_1 = require("./utils/ssl");
const logger_1 = __importDefault(require("./utils/logger"));
/**
 * Main application initialization function
 */
function initialize() {
    try {
        // Connect to MongoDB
        (0, db_1.default)();
        // Connect PM2 for monitoring
        (0, script_1.default)();
        // Load SSL certificates (only in development)
        const sslCredentials = (0, ssl_1.loadSSLCredentials)();
        // Create and start the server
        const server = (0, server_1.createServer)(app_1.default, sslCredentials);
        (0, server_1.startServer)(server);
        // Set up error handling
        setupErrorHandling(server);
    }
    catch (error) {
        logger_1.default.error('Failed to initialize application:', error);
        process.exit(1);
    }
}
/**
 * Configure process-level error handling
 */
function setupErrorHandling(server) {
    process.on('unhandledRejection', (error) => {
        logger_1.default.error('Unhandled Rejection:', error);
        server.close(() => process.exit(1));
    });
    process.on('SIGINT', () => {
        logger_1.default.info('Caught interrupt signal');
        server.close(() => process.exit(0));
    });
}
// Start the application
initialize();
