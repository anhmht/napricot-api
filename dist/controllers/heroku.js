"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deployFromWeb = exports.deploy = void 0;
const axios_1 = __importDefault(require("axios"));
const slack_1 = require("./slack");
const deploy = async () => {
    try {
        // Deploy master branch
        await axios_1.default.post(`https://kolkrabbi.heroku.com/apps/${process.env.HEROKU_APP_ID}/github/push`, {
            branch: 'master'
        }, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.HEROKU_ACCESS_TOKEN || ''}`
            }
        });
        await (0, slack_1.sendSlackMessage)({
            channel: process.env.SLACK_WEBHOOK_WEB_BUILD,
            message: 'Deploying master branch to Heroku. :rocket:',
            type: 'INFO'
        });
    }
    catch (error) {
        console.log(error);
    }
};
exports.deploy = deploy;
const deployFromWeb = async (req, res, next) => {
    await deploy();
    res.status(200).json({
        success: true
    });
};
exports.deployFromWeb = deployFromWeb;
