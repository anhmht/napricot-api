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
const userSchema = new _mongoose.default.Schema({
    name: {
        type: String,
        required: [
            true,
            'User name is required'
        ],
        unique: true
    },
    email: {
        type: String,
        required: [
            true,
            'Email is required'
        ],
        unique: true
    },
    password: {
        type: String,
        required: [
            true,
            'Password is required'
        ]
    },
    avatar: {
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
    roles: {
        type: [
            String
        ],
        enum: [
            'user',
            'admin',
            'superadmin'
        ],
        default: [
            'user'
        ]
    },
    shippingAddress: {
        addressLine1: {
            type: String
        },
        addressLine2: {
            type: String
        },
        city: {
            type: String
        },
        postalCode: {
            type: String
        },
        country: {
            type: String
        },
        phone: {
            type: String
        }
    },
    billingAddress: {
        addressLine1: {
            type: String
        },
        addressLine2: {
            type: String
        },
        city: {
            type: String
        },
        postalCode: {
            type: String
        },
        country: {
            type: String
        },
        phone: {
            type: String
        }
    },
    verifyCode: {
        type: String
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
const _default = _mongoose.default.model('users', userSchema, 'users');

//# sourceMappingURL=User.js.map