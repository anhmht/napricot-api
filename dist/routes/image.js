"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// Import controllers
const dropbox_1 = require("../controllers/dropbox");
const router = express_1.default.Router();
// uploadImage
router.post('/upload', dropbox_1.uploadImage);
// move Image
router.post('/move', dropbox_1.moveAndGetLink);
// delete Image
router.post('/delete', dropbox_1.deleteDropboxImages);
// move Images to Deleted Folder
router.post('/move-to-deleted-folder', dropbox_1.moveImagesToDeletedFolder);
exports.default = router;
