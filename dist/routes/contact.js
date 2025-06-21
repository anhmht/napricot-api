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
const _contact = require("../controllers/contact");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const router = _express.default.Router();
// create a contact
router.post('/', _contact.createContact);
// get all contacts
router.get('/', _authenticate.authenticateJWT, _authorize.authorize, _contact.getContacts);
// get a contact
router.get('/:id', _authenticate.authenticateJWT, _authorize.authorize, _contact.getContact);
// update a contact
router.put('/:id', _authenticate.authenticateJWT, _authorize.authorize, _contact.updateContact);
// delete multiple contacts
router.delete('/', _authenticate.authenticateJWT, _authorize.authorize, _contact.deleteContacts);
// update multiple contacts
router.put('/', _authenticate.authenticateJWT, _authorize.authorize, _contact.updateContacts);
const _default = router;

//# sourceMappingURL=contact.js.map