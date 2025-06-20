"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLinks = exports.updateLink = exports.createLink = exports.getLink = exports.getLinks = void 0;
const Link_1 = __importDefault(require("../schema/Link"));
const utils_1 = require("../utils");
const getLinks = async (req, res, next) => {
    try {
        const { page, limit, sort, words } = req.query;
        if (page && limit) {
            const search = (0, utils_1.createSearchObject)({
                searchLikeObject: words ? { words } : {}
            });
            const links = await Link_1.default.find(search)
                .skip((page - 1) * limit)
                .limit(limit)
                .sort({ [sort ?? 'createdAt']: 'desc' })
                .lean();
            const total = await Link_1.default.countDocuments(search).exec();
            res.status(200).json({
                links,
                total,
                totalPages: Math.ceil(total / limit)
            });
            return;
        }
        const links = await Link_1.default.find().lean();
        res.status(200).json({
            links
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.getLinks = getLinks;
const getLink = async (req, res, next) => {
    try {
        const { id } = req.params;
        const link = await Link_1.default.findById(id).lean();
        if (!link) {
            res.status(404).json({
                error: true,
                message: 'Link not found'
            });
            return next(new Error('Link not found'));
        }
        res.status(200).json({
            ...link
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.getLink = getLink;
const createLink = async (req, res, next) => {
    try {
        const missingField = (0, utils_1.getMissingFields)(req.body, ['words', 'url']);
        if (missingField) {
            res.status(400).json({
                error: true,
                field: missingField,
                message: `${missingField} is required`
            });
            return next(new Error('missing required field'));
        }
        // Make sure user is in the locals object to avoid TS errors
        if (!res.locals.user) {
            res.status(401).json({
                error: true,
                message: 'Unauthorized'
            });
            return next(new Error('Unauthorized'));
        }
        const link = await Link_1.default.create({
            ...req.body,
            posts: [],
            products: [],
            author: res.locals.user.userId,
            updatedBy: res.locals.user.userId
        });
        res.status(200).json({
            link
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.createLink = createLink;
const updateLink = async (req, res, next) => {
    try {
        const { id } = req.params;
        const link = await Link_1.default.findById(id);
        if (!link) {
            res.status(404).json({
                error: true,
                message: 'Link not found'
            });
            return next(new Error('Link not found'));
        }
        // Make sure user is in the locals object to avoid TS errors
        if (!res.locals.user) {
            res.status(401).json({
                error: true,
                message: 'Unauthorized'
            });
            return next(new Error('Unauthorized'));
        }
        const updatedLink = await Link_1.default.findByIdAndUpdate(id, {
            $set: { ...req.body, updatedBy: res.locals.user.userId }
        }, { new: true });
        res.status(200).json({
            link: updatedLink
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.updateLink = updateLink;
const deleteLinks = async (req, res, next) => {
    try {
        const { ids } = req.body;
        if (!ids) {
            res.status(400).json({
                error: true,
                message: 'ids is required'
            });
            return next(new Error('ids is required'));
        }
        await Link_1.default.deleteMany({
            _id: {
                $in: ids
            }
        });
        res.status(200).json({
            success: true,
            message: 'Links have been deleted.'
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.deleteLinks = deleteLinks;
