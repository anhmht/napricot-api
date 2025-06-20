"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// Import middlewares
const authenticate_1 = require("../middlewares/authenticate");
const authorize_1 = require("../middlewares/authorize");
// Import controllers
const link_1 = require("../controllers/link");
const router = express_1.default.Router();
// create a link
router.post('/', authenticate_1.authenticateJWT, authorize_1.authorize, link_1.createLink);
// get all Links
router.get('/', link_1.getLinks);
// get a link
router.get('/:id', authenticate_1.authenticateJWT, authorize_1.authorize, link_1.getLink);
// update a link
router.put('/:id', authenticate_1.authenticateJWT, authorize_1.authorize, link_1.updateLink);
// delete multiple links
router.delete('/', authenticate_1.authenticateJWT, authorize_1.authorize, link_1.deleteLinks);
exports.default = router;
