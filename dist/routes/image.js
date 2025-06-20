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
const _dropbox = require("../controllers/dropbox");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const router = _express.default.Router();
// uploadImage
router.post('/upload', _dropbox.uploadImage);
// move Image
router.post('/move', _dropbox.moveAndGetLink);
// delete Image
router.post('/delete', _dropbox.deleteDropboxImages);
// move Images to Deleted Folder
router.post('/move-to-deleted-folder', _dropbox.moveImagesToDeletedFolder);
const _default = router;

//# sourceMappingURL=image.js.map