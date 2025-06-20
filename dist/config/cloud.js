"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dropbox_1 = require("../controllers/dropbox");
const connectToDropbox = async () => {
    const token = await (0, dropbox_1.refreshToken)();
    if (token.data) {
        return token.data.access_token;
    }
};
exports.default = connectToDropbox;
