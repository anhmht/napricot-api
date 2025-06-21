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
const _dropbox = require("../controllers/dropbox");
const connectToDropbox = async ()=>{
    // Check if required environment variables are available
    if (!process.env.DROPBOX_REFRESH_TOKEN || !process.env.DROPBOX_CLIENT_ID || !process.env.DROPBOX_APP_SECRET) {
        console.error('Dropbox environment variables not available:', {
            refresh_token: !!process.env.DROPBOX_REFRESH_TOKEN,
            client_id: !!process.env.DROPBOX_CLIENT_ID,
            app_secret: !!process.env.DROPBOX_APP_SECRET
        });
        return undefined;
    }
    try {
        const token = await (0, _dropbox.refreshToken)();
        if (token?.data) {
            return token.data.access_token;
        }
        console.error('Failed to get token from refreshToken response');
        return undefined;
    } catch (error) {
        console.error('Error connecting to Dropbox:', error);
        return undefined;
    }
};
const _default = connectToDropbox;

//# sourceMappingURL=cloud.js.map