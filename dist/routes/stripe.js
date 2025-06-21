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
const _express = /*#__PURE__*/ _interop_require_default(require("express"));
const _stripe = require("../controllers/stripe");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const router = _express.default.Router();
// Handle Stripe webhook
router.post('/webhook', _express.default.raw({
    type: 'application/json'
}), _stripe.handleWebhook);
const _default = router;

//# sourceMappingURL=stripe.js.map