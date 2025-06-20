"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveImagesToDeletedFolder = exports.deleteDropboxImages = exports.moveAndGetLink = exports.uploadImage = exports.handleDropboxError = exports.refreshToken = void 0;
const axios_1 = __importDefault(require("axios"));
const querystring = __importStar(require("querystring"));
const dropbox_1 = require("dropbox");
const utils_1 = require("../utils");
const Image_1 = __importDefault(require("../schema/Image"));
const dbx = new dropbox_1.Dropbox();
const uploadImageToDropbox = async (data) => {
    try {
        const uploadedFile = await dbx.filesUpload({
            path: `/temp/${data.name}`,
            contents: data.image,
            mode: { '.tag': 'add' }
        });
        return uploadedFile;
    }
    catch (error) {
        console.log(error);
        await handleDropboxError(error, dbx);
        throw error;
    }
};
const deleteImage = async (data) => {
    try {
        const deletedFile = await dbx.filesDeleteBatch({
            entries: data
        });
        return deletedFile.result;
    }
    catch (error) {
        console.log(error);
        await handleDropboxError(error, dbx);
        throw error;
    }
};
const checkDeleteBatch = async (data) => {
    try {
        const job = await dbx.filesDeleteBatchCheck({
            async_job_id: data.async_job_id
        });
        return job;
    }
    catch (error) {
        console.log(error);
        await handleDropboxError(error, dbx);
        throw error;
    }
};
const moveImage = async (data) => {
    try {
        const movedFile = await dbx.filesMoveBatchV2({
            entries: data.entries,
            autorename: true
        });
        return movedFile.result;
    }
    catch (error) {
        console.log(error);
        await handleDropboxError(error, dbx);
        throw error;
    }
};
const checkMoveBatch = async (data) => {
    try {
        const job = await dbx.filesMoveBatchCheckV2({
            async_job_id: data.async_job_id
        });
        return job;
    }
    catch (error) {
        console.log(error);
        await handleDropboxError(error, dbx);
        throw error;
    }
};
const getLink = async (data) => {
    try {
        const file = await dbx.sharingCreateSharedLinkWithSettings({
            path: data.path
        });
        return file;
    }
    catch (error) {
        console.log(error);
        await handleDropboxError(error, dbx);
        throw error;
    }
};
const uploadImageToCloudflare = async (data) => {
    const formData = new FormData();
    formData.append('url', data.url);
    try {
        const uploadedFile = await axios_1.default.post(`https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v1`, formData, {
            headers: {
                Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        return `${process.env.FRONTEND_IMAGE_URL}/cdn-cgi/imagedelivery/veUt9FrhEFdGkfvZziYqkw/${uploadedFile.data.result.id}/`;
    }
    catch (error) {
        console.log(error);
        return undefined;
    }
};
const deleteImageFromCloudflare = async (data) => {
    const split = data.cloudflareUrl.split('/');
    const id = split[split.length - 2];
    try {
        await axios_1.default.delete(`https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v1/${id}`, {
            headers: {
                Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`
            }
        });
    }
    catch (error) {
        console.log(error);
    }
};
const uploadImage = async (req, res, next) => {
    if (!req.files?.files) {
        res.status(400);
        return next(new Error('No image uploaded'));
    }
    const { files } = req.files;
    // // If doesn't have image mime type prevent from uploading
    if (!files.mimetype.startsWith('image/')) {
        res.status(400);
        return next(new Error('Only images are allowed'));
    }
    if (!dbx.auth.getAccessToken()) {
        ;
        dbx.auth.setAccessToken(req.app.locals.dropboxAccessToken);
    }
    const fileContent = Buffer.from(files.data);
    try {
        const uploaded = await uploadImageToDropbox({
            image: fileContent,
            type: files.mimetype.split('/')[1],
            name: files.name
        });
        const link = await getLink({ path: uploaded.result.path_display });
        const image = await Image_1.default.create({
            url: link.result.url.replace('dl=0', 'raw=1'),
            path: uploaded.result.path_display
        });
        // All good
        res.status(200).json({
            id: image._id,
            url: image.url,
            path: image.path
        });
    }
    catch (error) {
        if (error.status === 401) {
            return await uploadImage(req, res, next);
        }
        res.status(error.status).json({
            error: true,
            message: 'Error uploading image'
        });
    }
};
exports.uploadImage = uploadImage;
const moveAndGetLink = async (req, res) => {
    const { slug, images, movePath } = req.body;
    if (!dbx.auth.getAccessToken()) {
        ;
        dbx.auth.setAccessToken(req.app.locals.dropboxAccessToken);
    }
    const entries = prepareImagesEntries(images, slug, movePath);
    try {
        const filesMove = await moveImage({
            entries
        });
        let retry = 20;
        while (retry) {
            const job = await checkMoveBatch({ async_job_id: filesMove.async_job_id });
            if (job.result['.tag'] === 'complete') {
                retry = 0;
            }
            else {
                await (0, utils_1.sleep)(1000);
                retry -= 1;
            }
        }
        const result = [];
        for (const [index, value] of entries.entries()) {
            const a = new Date();
            const cloudflareLink = await uploadImageToCloudflare({
                url: images[index].url
            });
            const image = await Image_1.default.findByIdAndUpdate(images[index].id, {
                path: value.to_path,
                url: images[index].url,
                cloudflareUrl: cloudflareLink
            }, {
                new: true
            });
            result.push(image);
            const b = new Date();
            console.log('Time taken to upload image:', b.getTime() - a.getTime(), images[index].id);
        }
        res.status(200).json({
            images: result
        });
    }
    catch (error) {
        if (error.status === 401) {
            return await moveAndGetLink(req, res);
        }
        res.status(error.status).json({
            error: true,
            message: 'Error uploading image'
        });
    }
};
exports.moveAndGetLink = moveAndGetLink;
const deleteDropboxImages = async (req, res) => {
    const { images = [], folders = [] } = req.body;
    if (!dbx.auth.getAccessToken()) {
        ;
        dbx.auth.setAccessToken(req.app.locals.dropboxAccessToken);
    }
    const entries = [];
    const imagesToDelete = [];
    if (folders.length === 0) {
        for (const img of images) {
            const image = await Image_1.default.findById(img.id).lean();
            if (image) {
                imagesToDelete.push(image);
                entries.push({ path: image.path });
            }
        }
    }
    else {
        folders.forEach((element) => {
            entries.push({ path: element });
        });
    }
    try {
        const filesDelete = await deleteImage(entries);
        let retry = 20;
        while (retry) {
            const job = await checkDeleteBatch({
                async_job_id: filesDelete.async_job_id
            });
            if (job.result['.tag'] === 'complete') {
                retry = 0;
            }
            else {
                await (0, utils_1.sleep)(1000);
                retry -= 1;
            }
        }
        for (const img of imagesToDelete) {
            if (img.cloudflareUrl) {
                await deleteImageFromCloudflare(img);
            }
            await Image_1.default.findByIdAndDelete(img._id);
        }
        res.status(200).json({
            success: true
        });
    }
    catch (error) {
        if (error.status === 401) {
            return await deleteDropboxImages(req, res);
        }
        res.status(error.status).json({
            error: true,
            message: 'Error deleting image'
        });
    }
};
exports.deleteDropboxImages = deleteDropboxImages;
const moveImagesToDeletedFolder = async (req, res) => {
    const { images, slug } = req.body;
    if (!dbx.auth.getAccessToken()) {
        ;
        dbx.auth.setAccessToken(req.app.locals.dropboxAccessToken);
    }
    const deleteImages = [];
    const databaseImages = [];
    try {
        for (const img of images) {
            const image = await Image_1.default.findById(img.id).lean();
            if (image) {
                databaseImages.push(image);
                deleteImages.push({ path: image.path });
            }
        }
        const entries = prepareImagesEntries(deleteImages, slug, 'Delete Folder');
        const filesMove = await moveImage({
            entries
        });
        let retry = 20;
        while (retry) {
            const job = await checkMoveBatch({ async_job_id: filesMove.async_job_id });
            if (job.result['.tag'] === 'complete') {
                retry = 0;
            }
            else {
                await (0, utils_1.sleep)(1000);
                retry -= 1;
            }
        }
        for (const img of databaseImages) {
            await Image_1.default.findByIdAndUpdate(img._id, {
                $set: {
                    path: entries.find((x) => x.from_path === img.path)?.to_path
                }
            });
        }
        res.status(200).json({
            success: true
        });
    }
    catch (error) {
        if (error.status === 401) {
            return await moveImagesToDeletedFolder(req, res);
        }
        res.status(error.status).json({
            error: true,
            message: 'Error moving image'
        });
    }
};
exports.moveImagesToDeletedFolder = moveImagesToDeletedFolder;
const refreshToken = async () => {
    try {
        return await axios_1.default.post('https://api.dropbox.com/oauth2/token', querystring.stringify({
            refresh_token: process.env.DROPBOX_REFRESH_TOKEN,
            grant_type: 'refresh_token',
            client_id: process.env.DROPBOX_CLIENT_ID,
            client_secret: process.env.DROPBOX_APP_SECRET
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
    }
    catch (error) {
        console.log(error);
        return null;
    }
};
exports.refreshToken = refreshToken;
const handleDropboxError = async (error, dbx) => {
    if (error.status === 401) {
        const token = await refreshToken();
        if (token?.data) {
            ;
            dbx.auth.setAccessToken(token.data.access_token);
        }
    }
    return null;
};
exports.handleDropboxError = handleDropboxError;
const prepareImagesEntries = (images, slug, path) => {
    return images.map((image, index) => {
        return {
            from_path: image.path,
            to_path: `/${path}/${slug}/${new Date().toISOString()}-${index}.jpg`
        };
    });
};
