"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableVariants = void 0;
const axios_1 = __importDefault(require("axios"));
const getAvailableVariants = async (req, res, next) => {
    try {
        const { provider, blueprint } = req.params;
        const { data } = await axios_1.default.get(`https://api.printify.com/v1/catalog/blueprints/${blueprint}/print_providers/${provider}/variants.json?show-out-of-stock=0`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.PRINTIFY_API_KEY}`
            }
        });
        res.status(200).json({
            variants: data.variants
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.getAvailableVariants = getAvailableVariants;
