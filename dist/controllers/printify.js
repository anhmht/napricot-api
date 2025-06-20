"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "getAvailableVariants", {
    enumerable: true,
    get: function() {
        return getAvailableVariants;
    }
});
const _axios = /*#__PURE__*/ _interop_require_default(require("axios"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const getAvailableVariants = async (req, res, next)=>{
    try {
        const { provider, blueprint } = req.params;
        const { data } = await _axios.default.get(`https://api.printify.com/v1/catalog/blueprints/${blueprint}/print_providers/${provider}/variants.json?show-out-of-stock=0`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.PRINTIFY_API_KEY}`
            }
        });
        res.status(200).json({
            variants: data.variants
        });
    } catch (error) {
        return next(error);
    }
};

//# sourceMappingURL=printify.js.map