"use strict";
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
    get deploy () {
        return deploy;
    },
    get deployFromWeb () {
        return deployFromWeb;
    }
});
const _axios = /*#__PURE__*/ _interop_require_default(require("axios"));
const _slack = require("./slack");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const deploy = async ()=>{
    try {
        // Deploy master branch
        await _axios.default.post(`https://kolkrabbi.heroku.com/apps/${process.env.HEROKU_APP_ID}/github/push`, {
            branch: 'master'
        }, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.HEROKU_ACCESS_TOKEN || ''}`
            }
        });
        await (0, _slack.sendSlackMessage)({
            channel: process.env.SLACK_WEBHOOK_WEB_BUILD,
            message: 'Deploying master branch to Heroku. :rocket:',
            type: 'INFO'
        });
    } catch (error) {
        console.log(error);
    }
};
const deployFromWeb = async (req, res, next)=>{
    await deploy();
    res.status(200).json({
        success: true
    });
};

//# sourceMappingURL=heroku.js.map