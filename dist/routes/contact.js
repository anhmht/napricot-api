"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// Import middlewares
const authenticate_1 = require("../middlewares/authenticate");
const authorize_1 = require("../middlewares/authorize");
// Import controllers using ES modules
const contact_1 = require("../controllers/contact");
const router = express_1.default.Router();
// create a contact
router.post('/', contact_1.createContact);
// get all contacts
router.get('/', authenticate_1.authenticateJWT, authorize_1.authorize, contact_1.getContacts);
// get a contact
router.get('/:id', authenticate_1.authenticateJWT, authorize_1.authorize, contact_1.getContact);
// update a contact
router.put('/:id', authenticate_1.authenticateJWT, authorize_1.authorize, contact_1.updateContact);
// delete multiple contacts
router.delete('/', authenticate_1.authenticateJWT, authorize_1.authorize, contact_1.deleteContacts);
// update multiple contacts
router.put('/', authenticate_1.authenticateJWT, authorize_1.authorize, contact_1.updateContacts);
exports.default = router;
