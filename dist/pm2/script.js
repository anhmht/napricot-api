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
const _pm2 = /*#__PURE__*/ _interop_require_default(require("pm2"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const connectPM2AndReload = async ()=>{
    // Connect to PM2 with master process
    if (process.env.NODE_APP_INSTANCE === '0') {
        _pm2.default.connect(true, (err)=>{
            if (err) {
                console.error(err);
                process.exit(2);
            }
            setTimeout(()=>{
                _pm2.default.reload('napricot-api', (err)=>{
                    if (err) {
                        console.error(err);
                        process.exit(2);
                    }
                    _pm2.default.disconnect();
                });
            }, 3600 * 1000 * 3); // 3 hours
        });
    }
};
const _default = connectPM2AndReload;

//# sourceMappingURL=script.js.map