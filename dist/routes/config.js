"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// Import controller
const heroku_1 = require("../controllers/heroku");
const router = express_1.default.Router();
// Deploy from web
router.post('/deploy', heroku_1.deployFromWeb);
exports.default = router;
