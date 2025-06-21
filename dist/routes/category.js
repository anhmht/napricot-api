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
const _category = require("../controllers/category");
const _authenticate = require("../middlewares/authenticate");
const _authorize = require("../middlewares/authorize");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const router = _express.default.Router();
// create a category
router.post('/', _authenticate.authenticateJWT, _authorize.authorize, _category.createCategory);
// get all categories
router.get('/', _category.getCategories);
// get a category
router.get('/:id', _authenticate.authenticateJWT, _authorize.authorize, _category.getCategory);
// update a category
router.put('/:id', _authenticate.authenticateJWT, _authorize.authorize, _category.updateCategory);
// delete a category
router.delete('/:id', _authenticate.authenticateJWT, _authorize.authorize, _category.deleteCategory);
// delete multiple categories
router.delete('/', _authenticate.authenticateJWT, _authorize.authorize, _category.deleteCategories);
const _default = router;

//# sourceMappingURL=category.js.map