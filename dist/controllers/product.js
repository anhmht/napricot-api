"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.getProduct = exports.getProducts = exports.updateProduct = exports.createProduct = void 0;
const Product_1 = __importDefault(require("../schema/Product"));
const utils_1 = require("../utils");
const logger_1 = __importDefault(require("../utils/logger"));
const errors_1 = require("../utils/errors");
const convertToPathArray = (images) => {
    return images.map((img) => img.path || img.url || '');
};
const createProduct = async (req, res, next) => {
    try {
        const { image, image: { id }, images, contentImages, slug } = req.body;
        const missingField = (0, utils_1.getMissingFields)(req.body, [
            'name',
            'categoryId',
            'content',
            'price',
            'author',
            'type'
        ]);
        if (missingField) {
            throw new errors_1.ValidationError(`${missingField} is required`, missingField);
        }
        const isProductExists = await Product_1.default.findOne({
            slug
        });
        if (isProductExists) {
            throw new errors_1.ValidationError('Product already exists', 'slug');
        }
        const product = await Product_1.default.create({
            ...req.body
        });
        res.status(200).json({
            product
        });
        try {
            const imagePaths = [image, ...images, ...contentImages].map((img) => img.path || img.url);
            const result = await (0, utils_1.callMoveAndGetLink)({
                slug: product.slug,
                images: imagePaths,
                movePath: 'Product',
                req
            });
            if (!result?.data)
                return;
            const { data } = result;
            let content = product.content || '';
            data.images.forEach((element) => {
                if (content.includes(element.url)) {
                    content = content.replace(element.url, element.thumbnailUrl || '');
                }
            });
            await Product_1.default.findByIdAndUpdate(product._id, {
                $set: {
                    image: {
                        id: data.images[0]._id,
                        url: data.images[0].url,
                        thumbnail: data.images[0].thumbnailUrl
                    },
                    images: data.images
                        .filter((img) => img._id !== id &&
                        !contentImages.map((i) => i.id).includes(img._id || ''))
                        .map((img) => ({
                        id: img._id,
                        url: img.url,
                        thumbnail: img.thumbnailUrl
                    })),
                    contentImages: data.images
                        .filter((img) => img._id !== id &&
                        !images.map((i) => i.id).includes(img._id || ''))
                        .map((img) => ({
                        id: img._id,
                        url: img.url,
                        thumbnail: img.thumbnailUrl
                    })),
                    content
                }
            }, { new: true });
            logger_1.default.info(`Product created successfully: ${product._id}`);
        }
        catch (error) {
            logger_1.default.error('Error processing product images:', error);
            return next(error);
        }
    }
    catch (error) {
        return next(error);
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { content, image, images, contentImages } = req.body;
        const product = await Product_1.default.findById(id);
        if (!product) {
            res.status(400).json({
                error: true,
                message: 'Product not found'
            });
            return next(new Error('Product not found'));
        }
        const updatedProduct = await Product_1.default.findByIdAndUpdate(id, {
            $set: req.body
        }, { new: true }).lean();
        res.status(200).json({
            updatedProduct
        });
        const insertImages = [];
        const deleteImages = [];
        if (product.image && image && product.image.id !== image.id) {
            insertImages.push(image);
            if (product.image)
                deleteImages.push(product.image);
        }
        if (product.images) {
            images.forEach((img) => {
                if (!product.images?.find((productImage) => productImage.id === img.id)) {
                    insertImages.push(img);
                }
            });
            product.images.forEach((img) => {
                if (!images.find((image) => image.id === img.id)) {
                    deleteImages.push(img);
                }
            });
        }
        if (product.contentImages) {
            contentImages.forEach((img) => {
                if (!product.contentImages?.find((image) => image.id === img.id)) {
                    insertImages.push(img);
                }
            });
            product.contentImages.forEach((img) => {
                if (!contentImages.find((image) => image.id === img.id)) {
                    deleteImages.push(img);
                }
            });
        }
        try {
            const deleteImagePaths = convertToPathArray(deleteImages);
            const deleteResult = deleteImages.length
                ? await (0, utils_1.callDeleteImages)({
                    images: deleteImagePaths,
                    folders: [],
                    req
                })
                : { data: { success: true } };
            if (!deleteResult?.data?.success)
                return;
            const insertImagePaths = convertToPathArray(insertImages);
            const moveResult = insertImages.length
                ? await (0, utils_1.callMoveAndGetLink)({
                    slug: product.slug,
                    images: insertImagePaths,
                    movePath: 'Product',
                    req,
                    nextIndex: (0, utils_1.getNextNumber)([
                        ...(product.image ? [product.image.thumbnail || ''] : []),
                        ...(product.images?.map((img) => img.thumbnail || '') || []),
                        ...(product.contentImages?.map((img) => img.thumbnail || '') ||
                            [])
                    ])
                })
                : { data: { images: [] } };
            if (!moveResult?.data)
                return;
            const { data } = moveResult;
            let updatedContent = content || '';
            data.images.forEach((element) => {
                if (updatedContent.includes(element.url)) {
                    updatedContent = updatedContent.replace(element.url, element.thumbnailUrl || '');
                }
            });
            const updateImage = data.images.find((img) => img._id === image?.id);
            await Product_1.default.findByIdAndUpdate(id, {
                $set: {
                    image: updateImage
                        ? {
                            id: updateImage._id,
                            url: updateImage.url,
                            thumbnail: updateImage.thumbnailUrl
                        }
                        : undefined,
                    images: images.map((img) => {
                        const updateImg = data.images.find((image) => image._id === img.id);
                        return {
                            id: updateImg ? updateImg._id : img.id,
                            url: updateImg ? updateImg.url : img.url,
                            thumbnail: updateImg ? updateImg.thumbnailUrl : img.thumbnail
                        };
                    }),
                    contentImages: contentImages.map((img) => {
                        const updateImg = data.images.find((image) => image._id === img.id);
                        return {
                            id: updateImg ? updateImg._id : img.id,
                            url: updateImg ? updateImg.url : img.url,
                            thumbnail: updateImg ? updateImg.thumbnailUrl : img.thumbnail
                        };
                    }),
                    content: updatedContent
                }
            }, { new: true });
            console.log('Product updated successfully');
        }
        catch (error) {
            return next(error);
        }
    }
    catch (error) {
        return next(error);
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await Product_1.default.findById(id);
        if (!product) {
            res.status(400).json({
                error: true,
                message: 'Product not found'
            });
            return next(new Error('Product not found'));
        }
        await Product_1.default.findByIdAndUpdate(id, {
            $set: {
                isDeleted: true
            }
        }, { new: true });
        res.status(200).json({
            success: true
        });
        try {
            if (product.image) {
                const imagePaths = [
                    {
                        id: product.image.id || '',
                        path: product.image.path || product.image.url || ''
                    }
                ];
                await (0, utils_1.callMoveImagesToDeletedFolder)({
                    images: imagePaths,
                    slug: product.slug,
                    req
                });
            }
            const imagesList = [
                ...(product.images || []),
                ...(product.contentImages || [])
            ].map((img) => ({
                id: img.id || '',
                path: img.path || img.url || ''
            }));
            if (imagesList.length > 0) {
                await (0, utils_1.callDeleteImages)({
                    images: imagesList,
                    folders: [
                        `/Product/${product.slug}`,
                        `/Product/${product.slug}/thumbnail`
                    ],
                    req
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
exports.deleteProduct = deleteProduct;
const getProducts = async (req, res, next) => {
    try {
        const { page = 1, size = 10 } = req.query;
        const products = await Product_1.default.find()
            .skip((Number(page) - 1) * Number(size))
            .limit(Number(size))
            .sort({ createdAt: -1 });
        res.status(200).json({
            products
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.getProducts = getProducts;
const getProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await Product_1.default.findById(id);
        if (!product) {
            res.status(400).json({
                error: true,
                message: 'Product not found'
            });
            return next(new Error('Product not found'));
        }
        res.status(200).json({
            product
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.getProduct = getProduct;
