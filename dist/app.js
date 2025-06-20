"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const express_query_boolean_1 = __importDefault(require("express-query-boolean"));
// Import our TypeScript routes
const routes_1 = require("./routes");
// Import modules
const cloud_1 = __importDefault(require("./config/cloud"));
const errors_1 = require("./utils/errors");
const cors_1 = require("./middlewares/cors");
const logger_1 = __importDefault(require("./utils/logger"));
/**
 * Initialize and configure the Express application
 */
function setupApp() {
    const app = (0, express_1.default)();
    // Stripe Webhook use raw body
    app.use('/stripe', routes_1.stripeRoutes);
    // Connect to Dropbox
    (0, cloud_1.default)().then((accessToken) => {
        if (accessToken) {
            app.locals.dropboxAccessToken = accessToken;
        }
    });
    // Apply middleware
    app.use(express_1.default.json());
    app.use((0, cors_1.configureCors)());
    // Use the express-fileupload middleware
    app.use((0, express_fileupload_1.default)({
        limits: {
            fileSize: 10000000 // Around 10MB
        },
        useTempFiles: true
    }));
    app.use((0, express_query_boolean_1.default)());
    // Routes - all are now using TypeScript versions
    app.use('/users', routes_1.userRoutes);
    app.use('/images', routes_1.imageRoutes);
    app.use('/', routes_1.authRoutes);
    app.use('/categories', routes_1.categoryRoutes);
    app.use('/email', routes_1.emailRoutes);
    app.use('/checkout', routes_1.checkoutRoutes);
    app.use('/post', routes_1.postRoutes);
    app.use('/product', routes_1.productRoutes);
    app.use('/slack', routes_1.slackRoutes);
    app.use('/link', routes_1.linkRoutes);
    app.use('/config', routes_1.configRoutes);
    app.use('/contact', routes_1.contactRoutes);
    app.use('/', routes_1.urlPreviewRoutes);
    // Register routes
    app.get('/', (req, res) => {
        res.json({
            message: 'Welcome to the Napricot Operations API'
        });
    });
    // Error handler - must be after all routes and other middleware
    app.use(errors_1.errorHandler);
    logger_1.default.info('Express application configured successfully');
    return app;
}
// Create and export the configured Express application
const app = setupApp();
exports.default = app;
