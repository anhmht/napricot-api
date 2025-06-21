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
const productSchema = new _mongoose.Schema({
    name: {
        type: String,
        required: [
            true,
            'Product name is required'
        ],
        unique: true
    },
    slug: {
        type: String,
        required: [
            true,
            'Product slug is required'
        ],
        unique: true
    },
    desc: {
        type: String
    },
    image: {
        id: {
            type: String
        },
        url: {
            type: String
        },
        cloudflareUrl: {
            type: String
        }
    },
    images: [
        {
            id: {
                type: String
            },
            url: {
                type: String
            },
            cloudflareUrl: {
                type: String
            }
        }
    ],
    contentImages: [
        {
            id: {
                type: String
            },
            url: {
                type: String
            },
            cloudflareUrl: {
                type: String
            }
        }
    ],
    price: {
        type: Number,
        required: [
            true,
            'Product price is required'
        ]
    },
    size: [
        {
            label: {
                type: String
            },
            costBonus: {
                type: Number,
                default: 0
            }
        }
    ],
    color: [
        {
            label: {
                type: String
            },
            value: {
                type: String
            },
            costBonus: {
                type: Number,
                default: 0
            }
        }
    ],
    type: {
        type: String,
        enum: [
            'clothing',
            'accessories',
            'digital'
        ],
        required: [
            true,
            'Product type is required'
        ]
    },
    files: [
        {
            url: {
                type: String
            }
        }
    ],
    tax: {
        type: Number
    },
    enableTax: {
        type: Boolean,
        default: false
    },
    categoryId: {
        type: _mongoose.Schema.Types.ObjectId,
        ref: 'categories',
        required: [
            true,
            'Product category is required'
        ]
    },
    content: {
        type: String
    },
    author: {
        type: _mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: [
            true,
            'Product author is required'
        ]
    },
    status: {
        type: String,
        enum: [
            'draft',
            'published',
            'deleted'
        ],
        default: 'draft'
    },
    tags: [
        {
            type: String
        }
    ],
    keywords: [
        {
            type: String
        }
    ],
    isDeleted: {
        type: Boolean,
        default: false
    },
    uploading: {
        type: Boolean,
        default: false
    },
    updatedBy: {
        type: String
    }
}, {
    timestamps: true
});
const _default = _mongoose.default.model('products', productSchema, 'products');

//# sourceMappingURL=Product.js.map