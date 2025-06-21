"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get createCategory () {
        return createCategory;
    },
    get deleteCategories () {
        return deleteCategories;
    },
    get deleteCategory () {
        return deleteCategory;
    },
    get getCategories () {
        return getCategories;
    },
    get getCategory () {
        return getCategory;
    },
    get updateCategory () {
        return updateCategory;
    }
});
const _Category = /*#__PURE__*/ _interop_require_default(require("../schema/Category"));
const _lodash = require("lodash");
const _utils = require("../utils");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const listToTree = (array)=>{
    if (array.length === 0) return [];
    let list = (0, _lodash.cloneDeep)(array);
    let map = {}, node, roots = [], i;
    for(i = 0; i < list.length; i += 1){
        const id = list[i]._id?.toString() || String(i);
        map[id] = i; // initialize the map
        list[i].children = []; // initialize the children
    }
    for(i = 0; i < list.length; i += 1){
        node = list[i];
        if (node.parentId) {
            // if you have dangling branches check that map[node.parentId] exists
            if (map[node.parentId] !== undefined) {
                list[map[node.parentId]].children.push(node);
            } else {
                roots.push(node);
            }
        } else {
            roots.push(node);
        }
    }
    return roots;
};
const createCategory = async (req, res, next)=>{
    try {
        const { slug } = req.body;
        const missingField = (0, _utils.getMissingFields)(req.body, [
            'name',
            'slug'
        ]);
        if (missingField) {
            res.status(400).json({
                error: true,
                field: missingField,
                message: `${missingField} is required`
            });
            return next(new Error('missing required field'));
        }
        // check if category already exists
        const isCategoryExists = await _Category.default.findOne({
            slug
        });
        if (isCategoryExists) {
            res.status(404).json({
                error: true,
                message: 'Category already exists'
            });
            return next(new Error('Category already exists'));
        }
        const category = await _Category.default.create({
            ...req.body
        });
        res.status(200).json({
            category
        });
    } catch (error) {
        return next(error);
    }
};
const getCategories = async (req, res, next)=>{
    try {
        const { page, limit, sort, name } = req.query;
        if (page && limit) {
            const search = (0, _utils.createSearchObject)({
                searchLikeObject: {
                    name: name
                }
            });
            const categories = await _Category.default.find(search).skip((Number(page) - 1) * Number(limit)).limit(Number(limit)).sort({
                [typeof sort === 'string' ? sort : 'createdAt']: 'desc'
            }).lean();
            const total = await _Category.default.countDocuments(search).exec();
            res.status(200).json({
                categories,
                total,
                totalPages: Math.ceil(total / Number(limit))
            });
            return;
        }
        const categories = await _Category.default.find().lean();
        const treeCategories = listToTree(categories);
        res.status(200).json({
            categories,
            treeCategories
        });
    } catch (error) {
        return next(error);
    }
};
const getCategory = async (req, res, next)=>{
    try {
        const { id } = req.params;
        const category = await _Category.default.findById(id).lean();
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
    } catch (error) {
        return next(error);
    }
};
const updateCategory = async (req, res, next)=>{
    try {
        const { id } = req.params;
        const category = await _Category.default.findById(id);
        if (!category) {
            res.status(404).json({
                error: true,
                message: 'Category not found'
            });
            return next(new Error('Category not found'));
        }
        const updatedCategory = await _Category.default.findByIdAndUpdate(id, {
            $set: req.body
        }, {
            new: true
        });
        res.status(200).json({
            category: updatedCategory
        });
    } catch (error) {
        return next(error);
    }
};
const deleteCategory = async (req, res, next)=>{
    try {
        const { id } = req.params;
        const category = await _Category.default.findById(id);
        if (!category) {
            res.status(404).json({
                error: true,
                message: 'Category not found'
            });
            return next(new Error('Category not found'));
        }
        await _Category.default.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: 'User has been deleted.'
        });
    } catch (error) {
        return next(error);
    }
};
const deleteCategories = async (req, res, next)=>{
    try {
        const { ids } = req.body;
        if (!ids) {
            res.status(400).json({
                error: true,
                message: 'ids is required'
            });
            return next(new Error('ids is required'));
        }
        await _Category.default.deleteMany({
            _id: {
                $in: ids
            }
        });
        res.status(200).json({
            success: true,
            message: 'Categories have been deleted.'
        });
    } catch (error) {
        return next(error);
    }
};

//# sourceMappingURL=category.js.map