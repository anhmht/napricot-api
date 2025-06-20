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
    get authRoutes () {
        return _auth.default;
    },
    get categoryRoutes () {
        return _category.default;
    },
    get checkoutRoutes () {
        return _checkout.default;
    },
    get configRoutes () {
        return _config.default;
    },
    get contactRoutes () {
        return _contact.default;
    },
    get emailRoutes () {
        return _email.default;
    },
    get imageRoutes () {
        return _image.default;
    },
    get linkRoutes () {
        return _link.default;
    },
    get postRoutes () {
        return _post.default;
    },
    get productRoutes () {
        return _product.default;
    },
    get slackRoutes () {
        return _slack.default;
    },
    get stripeRoutes () {
        return _stripe.default;
    },
    get urlPreviewRoutes () {
        return _urlPreview.default;
    },
    get userRoutes () {
        return _users.default;
    }
});
const _auth = /*#__PURE__*/ _interop_require_default(require("./auth"));
const _users = /*#__PURE__*/ _interop_require_default(require("./users"));
const _image = /*#__PURE__*/ _interop_require_default(require("./image"));
const _category = /*#__PURE__*/ _interop_require_default(require("./category"));
const _post = /*#__PURE__*/ _interop_require_default(require("./post"));
const _product = /*#__PURE__*/ _interop_require_default(require("./product"));
const _stripe = /*#__PURE__*/ _interop_require_default(require("./stripe"));
const _link = /*#__PURE__*/ _interop_require_default(require("./link"));
const _contact = /*#__PURE__*/ _interop_require_default(require("./contact"));
const _config = /*#__PURE__*/ _interop_require_default(require("./config"));
const _slack = /*#__PURE__*/ _interop_require_default(require("./slack"));
const _checkout = /*#__PURE__*/ _interop_require_default(require("./checkout"));
const _email = /*#__PURE__*/ _interop_require_default(require("./email"));
const _urlPreview = /*#__PURE__*/ _interop_require_default(require("./urlPreview"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}

//# sourceMappingURL=index.js.map