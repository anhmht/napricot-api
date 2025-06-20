"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// The controllers will need to be converted to TypeScript later
const product_1 = require("../controllers/product");
const printify_1 = require("../controllers/printify");
const router = express_1.default.Router();
// create product
router.post('/', product_1.createProduct);
// update product
router.put('/:id', product_1.updateProduct);
// get products
router.get('/', product_1.getProducts);
// get product
router.get('/:id', product_1.getProduct);
// delete product
router.delete('/:id', product_1.deleteProduct);
// get available printify variants
router.get('/printify/:provider/:blueprint', printify_1.getAvailableVariants);
exports.default = router;
