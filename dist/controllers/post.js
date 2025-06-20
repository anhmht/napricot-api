"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPostBySlug = exports.getPost = exports.getPosts = exports.deletePosts = exports.deletePost = exports.updatePost = exports.createPost = void 0;
const Post_1 = __importDefault(require("../schema/Post"));
const utils_1 = require("../utils");
const webSocket_1 = require("./webSocket");
const slack_1 = require("./slack");
const createPost = async (req, res, next) => {
    try {
        const { image, image: { id }, images, slug } = req.body;
        const missingField = (0, utils_1.getMissingFields)(req.body, [
            'title',
            'slug',
            'categoryId',
            'content'
        ]);
        if (missingField) {
            res.status(400).json({
                error: true,
                field: missingField,
                message: `${missingField} is required`
            });
            return next(new Error('missing required field'));
        }
        const isPostExists = await Post_1.default.findOne({
            slug
        });
        if (isPostExists) {
            res.status(404).json({
                error: true,
                field: 'slug',
                message: 'Post already exists'
            });
            return next(new Error('Post already exists'));
        }
        if (!res.locals.user) {
            res.status(401).json({
                error: true,
                message: 'Unauthorized'
            });
            return next(new Error('Unauthorized'));
        }
        const post = await Post_1.default.create({
            ...req.body,
            uploading: true,
            author: res.locals.user.userId,
            updatedBy: res.locals.user.userId
        });
        res.status(200).json({
            post
        });
        try {
            const result = await (0, utils_1.callMoveAndGetLink)({
                slug: post.slug,
                images: [image, ...images],
                movePath: 'Post',
                req
            });
            if (!result?.data)
                return;
            const { data } = result;
            let content = decodeURIComponent(post.content.replace(/%(?![0-9A-F]{2})/gi, '%25') // encode all % not followed by 2 hex digits
            ).replaceAll('&amp;', '&');
            data.images.forEach((element) => {
                if (content.includes(element.url) && element.cloudflareUrl) {
                    content = content.replace(element.url, element.cloudflareUrl + 'post872x424');
                }
            });
            const final = await Post_1.default.findByIdAndUpdate(post._id, {
                $set: {
                    image: {
                        id: data.images[0]._id,
                        url: data.images[0].url,
                        cloudflareUrl: data.images[0].cloudflareUrl
                    },
                    images: data.images
                        .filter((img) => img._id !== id)
                        .map((img) => ({
                        id: img._id,
                        url: img.url,
                        cloudflareUrl: img.cloudflareUrl
                    })),
                    content,
                    uploading: false
                }
            }, { new: true }).lean();
            if (final) {
                await (0, webSocket_1.broadcast)({
                    type: webSocket_1.notificationType.POST,
                    id: final._id,
                    uploading: false
                });
                await (0, slack_1.sendLogMessage)({
                    channel: process.env.SLACK_WEBHOOK_POST_LOG,
                    message: `Napricot post *created*`,
                    type: slack_1.messageType.SUCCESS,
                    data: final,
                    dataType: slack_1.dataTypes.POST
                });
            }
        }
        catch (error) {
            console.log(error);
            return next(error);
        }
    }
    catch (error) {
        return next(error);
    }
};
exports.createPost = createPost;
const updatePost = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { content, image, images, slug } = req.body;
        const missingField = (0, utils_1.getMissingFields)(req.body, [
            'title',
            'slug',
            'categoryId',
            'content'
        ]);
        if (missingField) {
            res.status(400).json({
                error: true,
                field: missingField,
                message: `${missingField} is required`
            });
            return next(new Error('missing required field'));
        }
        const post = await Post_1.default.findById(id);
        if (!post) {
            res.status(400).json({
                error: true,
                message: 'Post not found'
            });
            return next(new Error('Post not found'));
        }
        if (slug !== post.slug) {
            const isPostExists = await Post_1.default.findOne({
                slug
            });
            if (isPostExists) {
                res.status(404).json({
                    error: true,
                    field: 'slug',
                    message: 'Post already exists'
                });
                return next(new Error('Post already exists'));
            }
        }
        if (!res.locals.user) {
            res.status(401).json({
                error: true,
                message: 'Unauthorized'
            });
            return next(new Error('Unauthorized'));
        }
        const updatedPost = await Post_1.default.findByIdAndUpdate(id, {
            $set: {
                ...req.body,
                updatedBy: res.locals.user.userId,
                uploading: true
            }
        }, { new: true }).lean();
        res.status(200).json({
            updatedPost
        });
        const insertImages = [];
        const deleteImages = [];
        if (post.image && image && post.image.id !== image.id) {
            insertImages.push(image);
            deleteImages.push(post.image);
        }
        if (post.images && images) {
            images.forEach((img) => {
                if (!post.images?.find((image) => image.id === img.id)) {
                    insertImages.push(img);
                }
            });
            post.images.forEach((img) => {
                if (!images.find((image) => image.id === img.id)) {
                    deleteImages.push(img);
                }
            });
        }
        try {
            const deleteResult = deleteImages.length
                ? await (0, utils_1.callDeleteImages)({
                    images: deleteImages.map((img) => img.path || img.url || ''),
                    folders: [],
                    req
                })
                : { data: { success: true } };
            if (!deleteResult?.data?.success)
                return;
            const moveResult = insertImages.length
                ? await (0, utils_1.callMoveAndGetLink)({
                    slug: post.slug,
                    images: insertImages.map((img) => img.path || img.url || ''),
                    movePath: 'Post',
                    req
                })
                : { data: { images: [] } };
            if (!moveResult?.data)
                return;
            const { data } = moveResult;
            let updatedContent = decodeURIComponent(content.replace(/%(?![0-9A-F]{2})/gi, '%25') // encode all % not followed by 2 hex digits
            ).replaceAll('&amp;', '&');
            data.images.forEach((element) => {
                if (updatedContent.includes(element.url)) {
                    updatedContent = updatedContent.replace(element.url, element.cloudflareUrl + 'post872x424');
                }
            });
            const updateImage = data.images.find((img) => img._id === image?.id);
            const final = await Post_1.default.findByIdAndUpdate(id, {
                $set: {
                    image: updateImage
                        ? {
                            id: updateImage._id,
                            url: updateImage.url,
                            cloudflareUrl: updateImage.cloudflareUrl
                        }
                        : undefined,
                    images: images.map((img) => {
                        const updateImg = data.images.find((image) => image._id === img.id);
                        return {
                            id: updateImg ? updateImg._id : img.id,
                            url: updateImg ? updateImg.url : img.url,
                            cloudflareUrl: updateImg
                                ? updateImg.cloudflareUrl
                                : img.cloudflareUrl
                        };
                    }),
                    content: updatedContent,
                    uploading: false
                }
            }, { new: true }).lean();
            if (final) {
                await (0, webSocket_1.broadcast)({
                    type: webSocket_1.notificationType.POST,
                    id: final._id,
                    uploading: false
                });
                await (0, slack_1.sendLogMessage)({
                    channel: process.env.SLACK_WEBHOOK_POST_LOG,
                    message: `Napricot post *updated*`,
                    type: slack_1.messageType.WARNING,
                    data: final,
                    dataType: slack_1.dataTypes.POST
                });
            }
        }
        catch (error) {
            console.log(error);
            return next(error);
        }
    }
    catch (error) {
        return next(error);
    }
};
exports.updatePost = updatePost;
const deletePost = async (req, res, next) => {
    try {
        const { id } = req.params;
        const post = await Post_1.default.findById(id);
        if (!post) {
            res.status(400).json({
                error: true,
                message: 'Post not found'
            });
            return next(new Error('Post not found'));
        }
        await Post_1.default.findByIdAndDelete(id);
        res.status(200).json({
            success: true
        });
        try {
            await (0, utils_1.callDeleteImages)({
                images: [
                    post.image ? post.image.path || post.image.url || '' : '',
                    ...(post.images?.map((img) => img.path || img.url || '') || [])
                ].filter(Boolean),
                folders: [`/Post/${post.slug}`],
                req
            });
        }
        catch (error) {
            return next(error);
        }
    }
    catch (error) {
        return next(error);
    }
};
exports.deletePost = deletePost;
const deletePosts = async (req, res, next) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) {
            res.status(400).json({
                error: true,
                message: 'IDs are required and must be an array'
            });
            return next(new Error('IDs are required'));
        }
        const posts = await Post_1.default.find({
            _id: {
                $in: ids
            }
        });
        await Post_1.default.deleteMany({
            _id: {
                $in: ids
            }
        });
        res.status(200).json({
            success: true
        });
        try {
            const imagesToDelete = posts
                .map((post) => post.image)
                .concat(posts.flatMap((post) => post.images || []))
                .filter(Boolean)
                .map((img) => img.path || img.url || '')
                .filter(Boolean);
            await (0, utils_1.callDeleteImages)({
                images: imagesToDelete,
                folders: posts.map((post) => `/Post/${post.slug}`),
                req
            });
            for (const post of posts) {
                await (0, slack_1.sendLogMessage)({
                    channel: process.env.SLACK_WEBHOOK_POST_LOG,
                    message: `Napricot post *deleted*`,
                    type: slack_1.messageType.ERROR,
                    data: post,
                    dataType: slack_1.dataTypes.POST
                });
            }
        }
        catch (error) {
            return next(error);
        }
    }
    catch (error) {
        return next(error);
    }
};
exports.deletePosts = deletePosts;
const getPosts = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, sort, title, categoryId, status } = req.query;
        const search = (0, utils_1.createSearchObject)({
            searchLikeObject: title ? { title } : undefined,
            searchEqualObject: {
                ...(categoryId ? { categoryId } : {}),
                ...(status ? { status } : {})
            }
        });
        const posts = await Post_1.default.find(search)
            .select('-content')
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit))
            .sort({ [sort || 'createdAt']: 'desc' })
            .lean();
        const total = await Post_1.default.countDocuments(search).exec();
        res.status(200).json({
            posts,
            total,
            totalPages: Math.ceil(total / Number(limit))
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.getPosts = getPosts;
const getPost = async (req, res, next) => {
    try {
        const { id } = req.params;
        const post = await Post_1.default.findById(id);
        if (!post) {
            res.status(400).json({
                error: true,
                message: 'Post not found'
            });
            return next(new Error('Post not found'));
        }
        res.status(200).json({
            post
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.getPost = getPost;
const getPostBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const post = await Post_1.default.findOne({
            slug,
            status: 'published'
        });
        if (!post) {
            res.status(400).json({
                error: true,
                message: 'Post not found'
            });
            return next(new Error('Post not found'));
        }
        res.status(200).json({
            post
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.getPostBySlug = getPostBySlug;
