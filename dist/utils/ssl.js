/**
 * SSL Certificate Utility
 * Handles loading SSL certificates for HTTPS server
 */ "use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "loadSSLCredentials", {
    enumerable: true,
    get: function() {
        return loadSSLCredentials;
    }
});
const _fs = /*#__PURE__*/ _interop_require_default(require("fs"));
const _path = /*#__PURE__*/ _interop_require_default(require("path"));
const _env = require("../config/env");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
// Determine the project root directory more reliably
const PROJECT_ROOT = _path.default.resolve(__dirname, '../..');
function loadSSLCredentials() {
    // Don't load SSL in production as Render handles SSL termination
    if (_env.config.isProduction) {
        return null;
    }
    // Log the paths we're going to use for debugging
    const keyPath = _path.default.join(PROJECT_ROOT, '.ssl/server.key');
    const certPath = _path.default.join(PROJECT_ROOT, '.ssl/server.crt');
    console.log('Looking for SSL certificates at:');
    console.log(`Key: ${keyPath}`);
    console.log(`Certificate: ${certPath}`);
    try {
        // Use absolute paths based on the project root
        const privateKey = _fs.default.readFileSync(keyPath, 'utf8');
        const certificate = _fs.default.readFileSync(certPath, 'utf8');
        console.log('SSL certificates loaded successfully for development');
        return {
            key: privateKey,
            cert: certificate
        };
    } catch (error) {
        console.error('Error loading SSL certificates:', error);
        console.log('Will fall back to HTTP server');
        return null;
    }
}

//# sourceMappingURL=ssl.js.map