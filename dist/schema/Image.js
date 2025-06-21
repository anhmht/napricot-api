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
const _mongoose = /*#__PURE__*/ _interop_require_default(require("mongoose"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const imageSchema = new _mongoose.default.Schema({
    path: {
        type: String,
        required: [
            true,
            'path is required'
        ]
    },
    url: {
        type: String,
        required: [
            true,
            'url is required'
        ]
    },
    thumbnailPath: {
        type: String
    },
    thumbnailUrl: {
        type: String
    },
    cloudflareUrl: {
        type: String
    }
}, {
    timestamps: true
});
const _default = _mongoose.default.model('images', imageSchema, 'images');

//# sourceMappingURL=Image.js.map