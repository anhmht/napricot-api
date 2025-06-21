/**
 * Server Factory
 * Creates the appropriate server (HTTP or HTTPS) based on environment
 */ "use strict";
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
    get createServer () {
        return createServer;
    },
    get startServer () {
        return startServer;
    }
});
const _http = /*#__PURE__*/ _interop_require_default(require("http"));
const _https = /*#__PURE__*/ _interop_require_default(require("https"));
const _env = require("../config/env");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function createServer(app, sslCredentials) {
    // Use HTTPS server in development with valid credentials
    if (!_env.config.isProduction && sslCredentials) {
        const server = _https.default.createServer(sslCredentials, app);
        return server;
    }
    // Otherwise use HTTP server (for production or if SSL certs are missing)
    return _http.default.createServer(app);
}
function startServer(server) {
    server.listen(_env.config.port, ()=>{
        const protocol = server instanceof _https.default.Server ? 'HTTPS' : 'HTTP';
        console.log(`Server started listening on ${_env.config.port} in ${_env.config.nodeEnv} mode (${protocol})`);
        // Signal to PM2 that server is ready
        if (process.send) {
            process.send('ready');
        }
    });
    return server;
}

//# sourceMappingURL=server.js.map