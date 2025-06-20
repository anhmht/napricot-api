"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// The controllers and middlewares will need to be converted to TypeScript later
const category_1 = require("../controllers/category");
// Import middlewares using ES modules syntax
const authenticate_1 = require("../middlewares/authenticate");
const authorize_1 = require("../middlewares/authorize");
const router = express_1.default.Router();
// create a category
router.post('/', authenticate_1.authenticateJWT, authorize_1.authorize, category_1.createCategory);
// get all categories
router.get('/', category_1.getCategories);
// get a category
router.get('/:id', authenticate_1.authenticateJWT, authorize_1.authorize, category_1.getCategory);
// update a category
router.put('/:id', authenticate_1.authenticateJWT, authorize_1.authorize, category_1.updateCategory);
// delete a category
router.delete('/:id', authenticate_1.authenticateJWT, authorize_1.authorize, category_1.deleteCategory);
// delete multiple categories
router.delete('/', authenticate_1.authenticateJWT, authorize_1.authorize, category_1.deleteCategories);
exports.default = router;
