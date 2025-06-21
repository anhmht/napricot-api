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
const _mongoose = /*#__PURE__*/ _interop_require_wildcard(require("mongoose"));
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
const categorySchema = new _mongoose.default.Schema({
    name: {
        type: String,
        required: [
            true,
            'Category name is required'
        ],
        unique: true
    },
    slug: {
        type: String,
        required: [
            true,
            'Category slug is required'
        ],
        unique: true
    },
    desc: {
        type: String
    },
    image: {
        id: {
            type: _mongoose.Schema.Types.ObjectId,
            ref: 'images'
        },
        url: {
            type: String
        },
        thumbnail: {
            type: String
        }
    },
    parentId: {
        type: String
    },
    type: {
        type: String,
        enum: [
            'product',
            'post'
        ],
        default: 'product'
    }
}, {
    timestamps: true
});
const _default = _mongoose.default.model('categories', categorySchema, 'categories');

//# sourceMappingURL=Category.js.map