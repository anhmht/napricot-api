// Load environment variables FIRST
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
require("./env-setup");
const _app = /*#__PURE__*/ _interop_require_default(require("./app"));
const _db = /*#__PURE__*/ _interop_require_default(require("./config/db"));
const _script = /*#__PURE__*/ _interop_require_default(require("./pm2/script"));
const _server = require("./server/server");
const _ssl = require("./utils/ssl");
const _logger = /*#__PURE__*/ _interop_require_default(require("./utils/logger"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
/**
 * Main application initialization function
 */ function initialize() {
    try {
        // Connect to MongoDB
        (0, _db.default)();
        // Connect PM2 for monitoring
        (0, _script.default)();
        // Load SSL certificates (only in development)
        const sslCredentials = (0, _ssl.loadSSLCredentials)();
        // Create and start the server
        const server = (0, _server.createServer)(_app.default, sslCredentials);
        (0, _server.startServer)(server);
        // Set up error handling
        setupErrorHandling(server);
    } catch (error) {
        _logger.default.error('Failed to initialize application:', error);
        process.exit(1);
    }
}
/**
 * Configure process-level error handling
 */ function setupErrorHandling(server) {
    process.on('unhandledRejection', (error)=>{
        _logger.default.error('Unhandled Rejection:', error);
        server.close(()=>process.exit(1));
    });
    process.on('SIGINT', ()=>{
        _logger.default.info('Caught interrupt signal');
        server.close(()=>process.exit(0));
    });
}
// Start the application
initialize();

//# sourceMappingURL=index.js.map