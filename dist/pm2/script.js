"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pm2_1 = __importDefault(require("pm2"));
const connectPM2AndReload = async () => {
    // Connect to PM2 with master process
    if (process.env.NODE_APP_INSTANCE === '0') {
        pm2_1.default.connect(true, (err) => {
            if (err) {
                console.error(err);
                process.exit(2);
            }
            setTimeout(() => {
                pm2_1.default.reload('napricot-api', (err) => {
                    if (err) {
                        console.error(err);
                        process.exit(2);
                    }
                    pm2_1.default.disconnect();
                });
            }, 3600 * 1000 * 3); // 3 hours
        });
    }
};
exports.default = connectPM2AndReload;
