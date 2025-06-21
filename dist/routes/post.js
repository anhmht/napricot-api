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
const _post = require("../controllers/post");
const _authenticate = require("../middlewares/authenticate");
const _authorize = require("../middlewares/authorize");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const router = _express.default.Router();
// createPost
router.post('/', _authenticate.authenticateJWT, _authorize.authorize, _post.createPost);
// updatePost
router.put('/:id', _authenticate.authenticateJWT, _authorize.authorize, _post.updatePost);
// getPosts
router.get('/', _post.getPosts);
// getPost
router.get('/:id', _post.getPost);
// getPostBySlug
router.get('/slug/:slug', _post.getPostBySlug);
// deletePost
router.delete('/:id', _authenticate.authenticateJWT, _authorize.authorize, _post.deletePost);
// deletePosts
router.delete('/', _authenticate.authenticateJWT, _authorize.authorize, _post.deletePosts);
const _default = router;

//# sourceMappingURL=post.js.map