"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategories = exports.getCategory = exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategories = void 0;
const Category_1 = __importDefault(require("../schema/Category"));
const lodash_1 = require("lodash");
const utils_1 = require("../utils");
const listToTree = (array) => {
    if (array.length === 0)
        return [];
    let list = (0, lodash_1.cloneDeep)(array);
    let map = {}, node, roots = [], i;
    for (i = 0; i < list.length; i += 1) {
        const id = list[i]._id?.toString() || String(i);
        map[id] = i; // initialize the map
        list[i].children = []; // initialize the children
    }
    for (i = 0; i < list.length; i += 1) {
        node = list[i];
        if (node.parentId) {
            // if you have dangling branches check that map[node.parentId] exists
            if (map[node.parentId] !== undefined) {
                list[map[node.parentId]].children.push(node);
            }
            else {
                roots.push(node);
            }
        }
        else {
            roots.push(node);
        }
    }
    return roots;
};
const createCategory = async (req, res, next) => {
    try {
        const { slug } = req.body;
        const missingField = (0, utils_1.getMissingFields)(req.body, ['name', 'slug']);
        if (missingField) {
            res.status(400).json({
                error: true,
                field: missingField,
                message: `${missingField} is required`
            });
            return next(new Error('missing required field'));
        }
        // check if category already exists
        const isCategoryExists = await Category_1.default.findOne({ slug });
        if (isCategoryExists) {
            res.status(404).json({
                error: true,
                message: 'Category already exists'
            });
            return next(new Error('Category already exists'));
        }
        const category = await Category_1.default.create({
            ...req.body
        });
        res.status(200).json({
            category
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.createCategory = createCategory;
const getCategories = async (req, res, next) => {
    try {
        const { page, limit, sort, name } = req.query;
        if (page && limit) {
            const search = (0, utils_1.createSearchObject)({
                searchLikeObject: { name: name }
            });
            const categories = await Category_1.default.find(search)
                .skip((Number(page) - 1) * Number(limit))
                .limit(Number(limit))
                .sort({ [typeof sort === 'string' ? sort : 'createdAt']: 'desc' })
                .lean();
            const total = await Category_1.default.countDocuments(search).exec();
            res.status(200).json({
                categories,
                total,
                totalPages: Math.ceil(total / Number(limit))
            });
            return;
        }
        const categories = await Category_1.default.find().lean();
        const treeCategories = listToTree(categories);
        res.status(200).json({
            categories,
            treeCategories
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.getCategories = getCategories;
const getCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const category = await Category_1.default.findById(id).lean();
        if (!category) {
            res.status(404).json({
                error: true,
                message: 'Category not found'
            });
            return next(new Error('Category not found'));
        }
        res.status(200).json({
            ...category
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.getCategory = getCategory;
const updateCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const category = await Category_1.default.findById(id);
        if (!category) {
            res.status(404).json({
                error: true,
                message: 'Category not found'
            });
            return next(new Error('Category not found'));
        }
        const updatedCategory = await Category_1.default.findByIdAndUpdate(id, {
            $set: req.body
        }, { new: true });
        res.status(200).json({
            category: updatedCategory
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const category = await Category_1.default.findById(id);
        if (!category) {
            res.status(404).json({
                error: true,
                message: 'Category not found'
            });
            return next(new Error('Category not found'));
        }
        await Category_1.default.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: 'User has been deleted.'
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.deleteCategory = deleteCategory;
const deleteCategories = async (req, res, next) => {
    try {
        const { ids } = req.body;
        if (!ids) {
            res.status(400).json({
                error: true,
                message: 'ids is required'
            });
            return next(new Error('ids is required'));
        }
        await Category_1.default.deleteMany({
            _id: {
                $in: ids
            }
        });
        res.status(200).json({
            success: true,
            message: 'Categories have been deleted.'
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.deleteCategories = deleteCategories;
