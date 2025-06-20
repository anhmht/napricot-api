"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// The controllers and middlewares will need to be converted to TypeScript later
const post_1 = require("../controllers/post");
const authenticate_1 = require("../middlewares/authenticate");
const authorize_1 = require("../middlewares/authorize");
const router = express_1.default.Router();
// createPost
router.post('/', authenticate_1.authenticateJWT, authorize_1.authorize, post_1.createPost);
// updatePost
router.put('/:id', authenticate_1.authenticateJWT, authorize_1.authorize, post_1.updatePost);
// getPosts
router.get('/', post_1.getPosts);
// getPost
router.get('/:id', post_1.getPost);
// getPostBySlug
router.get('/slug/:slug', post_1.getPostBySlug);
// deletePost
router.delete('/:id', authenticate_1.authenticateJWT, authorize_1.authorize, post_1.deletePost);
// deletePosts
router.delete('/', authenticate_1.authenticateJWT, authorize_1.authorize, post_1.deletePosts);
exports.default = router;
