/**
 * CORS Configuration
 * Sets up the CORS middleware for the application
 */ "use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "configureCors", {
    enumerable: true,
    get: function() {
        return configureCors;
    }
});
const _cors = /*#__PURE__*/ _interop_require_default(require("cors"));
const _env = require("../config/env");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function configureCors() {
    const corsOptions = {
        origin: (origin, callback)=>{
            if (_env.config.whitelist.indexOf(origin ?? '') !== -1 || !origin) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        }
    };
    return (0, _cors.default)(corsOptions);
}

//# sourceMappingURL=cors.js.map