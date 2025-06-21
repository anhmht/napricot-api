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
    get createLink () {
        return createLink;
    },
    get deleteLinks () {
        return deleteLinks;
    },
    get getLink () {
        return getLink;
    },
    get getLinks () {
        return getLinks;
    },
    get updateLink () {
        return updateLink;
    }
});
const _Link = /*#__PURE__*/ _interop_require_default(require("../schema/Link"));
const _utils = require("../utils");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const getLinks = async (req, res, next)=>{
    try {
        const { page, limit, sort, words } = req.query;
        if (page && limit) {
            const search = (0, _utils.createSearchObject)({
                searchLikeObject: words ? {
                    words
                } : {}
            });
            const links = await _Link.default.find(search).skip((page - 1) * limit).limit(limit).sort({
                [sort ?? 'createdAt']: 'desc'
            }).lean();
            const total = await _Link.default.countDocuments(search).exec();
            res.status(200).json({
                links,
                total,
                totalPages: Math.ceil(total / limit)
            });
            return;
        }
        const links = await _Link.default.find().lean();
        res.status(200).json({
            links
        });
    } catch (error) {
        return next(error);
    }
};
const getLink = async (req, res, next)=>{
    try {
        const { id } = req.params;
        const link = await _Link.default.findById(id).lean();
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
    } catch (error) {
        return next(error);
    }
};
const createLink = async (req, res, next)=>{
    try {
        const missingField = (0, _utils.getMissingFields)(req.body, [
            'words',
            'url'
        ]);
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
        const link = await _Link.default.create({
            ...req.body,
            posts: [],
            products: [],
            author: res.locals.user.userId,
            updatedBy: res.locals.user.userId
        });
        res.status(200).json({
            link
        });
    } catch (error) {
        return next(error);
    }
};
const updateLink = async (req, res, next)=>{
    try {
        const { id } = req.params;
        const link = await _Link.default.findById(id);
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
        const updatedLink = await _Link.default.findByIdAndUpdate(id, {
            $set: {
                ...req.body,
                updatedBy: res.locals.user.userId
            }
        }, {
            new: true
        });
        res.status(200).json({
            link: updatedLink
        });
    } catch (error) {
        return next(error);
    }
};
const deleteLinks = async (req, res, next)=>{
    try {
        const { ids } = req.body;
        if (!ids) {
            res.status(400).json({
                error: true,
                message: 'ids is required'
            });
            return next(new Error('ids is required'));
        }
        await _Link.default.deleteMany({
            _id: {
                $in: ids
            }
        });
        res.status(200).json({
            success: true,
            message: 'Links have been deleted.'
        });
    } catch (error) {
        return next(error);
    }
};

//# sourceMappingURL=link.js.map