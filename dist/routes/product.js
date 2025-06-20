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
const _product = require("../controllers/product");
const _printify = require("../controllers/printify");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const router = _express.default.Router();
// create product
router.post('/', _product.createProduct);
// update product
router.put('/:id', _product.updateProduct);
// get products
router.get('/', _product.getProducts);
// get product
router.get('/:id', _product.getProduct);
// delete product
router.delete('/:id', _product.deleteProduct);
// get available printify variants
router.get('/printify/:provider/:blueprint', _printify.getAvailableVariants);
const _default = router;

//# sourceMappingURL=product.js.map