"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _express = /*#__PURE__*/ _interop_require_default(require("express"));
const _expressfileupload = /*#__PURE__*/ _interop_require_default(require("express-fileupload"));
const _expressqueryboolean = /*#__PURE__*/ _interop_require_default(require("express-query-boolean"));
const _routes = require("./routes");
const _cloud = /*#__PURE__*/ _interop_require_default(require("./config/cloud"));
const _errors = require("./utils/errors");
const _cors = require("./middlewares/cors");
const _logger = /*#__PURE__*/ _interop_require_default(require("./utils/logger"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
/**
 * Initialize and configure the Express application
 */ function setupApp() {
    const app = (0, _express.default)();
    // Stripe Webhook use raw body
    app.use('/stripe', _routes.stripeRoutes);
    // Connect to Dropbox
    (0, _cloud.default)().then((accessToken)=>{
        if (accessToken) {
            app.locals.dropboxAccessToken = accessToken;
        }
    });
    // Apply middleware
    app.use(_express.default.json());
    app.use((0, _cors.configureCors)());
    // Use the express-fileupload middleware
    app.use((0, _expressfileupload.default)({
        limits: {
            fileSize: 10000000 // Around 10MB
        },
        useTempFiles: true
    }));
    app.use((0, _expressqueryboolean.default)());
    // Routes - all are now using TypeScript versions
    app.use('/users', _routes.userRoutes);
    app.use('/images', _routes.imageRoutes);
    app.use('/', _routes.authRoutes);
    app.use('/categories', _routes.categoryRoutes);
    app.use('/email', _routes.emailRoutes);
    app.use('/checkout', _routes.checkoutRoutes);
    app.use('/post', _routes.postRoutes);
    app.use('/product', _routes.productRoutes);
    app.use('/slack', _routes.slackRoutes);
    app.use('/link', _routes.linkRoutes);
    app.use('/config', _routes.configRoutes);
    app.use('/contact', _routes.contactRoutes);
    app.use('/', _routes.urlPreviewRoutes);
    // Register routes
    app.get('/', (req, res)=>{
        res.json({
            message: 'Welcome to the Napricot Operations API'
        });
    });
    // Error handler - must be after all routes and other middleware
    app.use(_errors.errorHandler);
    _logger.default.info('Express application configured successfully');
    return app;
}
// Create and export the configured Express application
const app = setupApp();
const _default = app;

//# sourceMappingURL=app.js.map