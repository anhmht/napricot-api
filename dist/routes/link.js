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
const _authenticate = require("../middlewares/authenticate");
const _authorize = require("../middlewares/authorize");
const _link = require("../controllers/link");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const router = _express.default.Router();
// create a link
router.post('/', _authenticate.authenticateJWT, _authorize.authorize, _link.createLink);
// get all Links
router.get('/', _link.getLinks);
// get a link
router.get('/:id', _authenticate.authenticateJWT, _authorize.authorize, _link.getLink);
// update a link
router.put('/:id', _authenticate.authenticateJWT, _authorize.authorize, _link.updateLink);
// delete multiple links
router.delete('/', _authenticate.authenticateJWT, _authorize.authorize, _link.deleteLinks);
const _default = router;

//# sourceMappingURL=link.js.map