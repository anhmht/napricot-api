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
    get deleteDropboxImages () {
        return deleteDropboxImages;
    },
    get handleDropboxError () {
        return handleDropboxError;
    },
    get moveAndGetLink () {
        return moveAndGetLink;
    },
    get moveImagesToDeletedFolder () {
        return moveImagesToDeletedFolder;
    },
    get refreshToken () {
        return refreshToken;
    },
    get uploadImage () {
        return uploadImage;
    }
});
const _axios = /*#__PURE__*/ _interop_require_default(require("axios"));
const _querystring = /*#__PURE__*/ _interop_require_wildcard(require("querystring"));
const _dropbox = require("dropbox");
const _utils = require("../utils");
const _Image = /*#__PURE__*/ _interop_require_default(require("../schema/Image"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
const dbx = new _dropbox.Dropbox();
const uploadImageToDropbox = async (data)=>{
    try {
        const uploadedFile = await dbx.filesUpload({
            path: `/temp/${data.name}`,
            contents: data.image,
            mode: {
                '.tag': 'add'
            }
        });
        return uploadedFile;
    } catch (error) {
        console.log(error);
        await handleDropboxError(error, dbx);
        throw error;
    }
};
const deleteImage = async (data)=>{
    try {
        const deletedFile = await dbx.filesDeleteBatch({
            entries: data
        });
        return deletedFile.result;
    } catch (error) {
        console.log(error);
        await handleDropboxError(error, dbx);
        throw error;
    }
};
const checkDeleteBatch = async (data)=>{
    try {
        const job = await dbx.filesDeleteBatchCheck({
            async_job_id: data.async_job_id
        });
        return job;
    } catch (error) {
        console.log(error);
        await handleDropboxError(error, dbx);
        throw error;
    }
};
const moveImage = async (data)=>{
    try {
        const movedFile = await dbx.filesMoveBatchV2({
            entries: data.entries,
            autorename: true
        });
        return movedFile.result;
    } catch (error) {
        console.log(error);
        await handleDropboxError(error, dbx);
        throw error;
    }
};
const checkMoveBatch = async (data)=>{
    try {
        const job = await dbx.filesMoveBatchCheckV2({
            async_job_id: data.async_job_id
        });
        return job;
    } catch (error) {
        console.log(error);
        await handleDropboxError(error, dbx);
        throw error;
    }
};
const getLink = async (data)=>{
    try {
        const file = await dbx.sharingCreateSharedLinkWithSettings({
            path: data.path
        });
        return file;
    } catch (error) {
        console.log(error);
        await handleDropboxError(error, dbx);
        throw error;
    }
};
const uploadImageToCloudflare = async (data)=>{
    const formData = new FormData();
    formData.append('url', data.url);
    try {
        const uploadedFile = await _axios.default.post(`https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v1`, formData, {
            headers: {
                Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        return `${process.env.FRONTEND_IMAGE_URL}/cdn-cgi/imagedelivery/veUt9FrhEFdGkfvZziYqkw/${uploadedFile.data.result.id}/`;
    } catch (error) {
        console.log(error);
        return undefined;
    }
};
const deleteImageFromCloudflare = async (data)=>{
    const split = data.cloudflareUrl.split('/');
    const id = split[split.length - 2];
    try {
        await _axios.default.delete(`https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v1/${id}`, {
            headers: {
                Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`
            }
        });
    } catch (error) {
        console.log(error);
    }
};
const uploadImage = async (req, res, next)=>{
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
        const link = await getLink({
            path: uploaded.result.path_display
        });
        const image = await _Image.default.create({
            url: link.result.url.replace('dl=0', 'raw=1'),
            path: uploaded.result.path_display
        });
        // All good
        res.status(200).json({
            id: image._id,
            url: image.url,
            path: image.path
        });
    } catch (error) {
        if (error.status === 401) {
            return await uploadImage(req, res, next);
        }
        res.status(error.status).json({
            error: true,
            message: 'Error uploading image'
        });
    }
};
const moveAndGetLink = async (req, res)=>{
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
        while(retry){
            const job = await checkMoveBatch({
                async_job_id: filesMove.async_job_id
            });
            if (job.result['.tag'] === 'complete') {
                retry = 0;
            } else {
                await (0, _utils.sleep)(1000);
                retry -= 1;
            }
        }
        const result = [];
        for (const [index, value] of entries.entries()){
            const a = new Date();
            const cloudflareLink = await uploadImageToCloudflare({
                url: images[index].url
            });
            const image = await _Image.default.findByIdAndUpdate(images[index].id, {
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
    } catch (error) {
        if (error.status === 401) {
            return await moveAndGetLink(req, res);
        }
        res.status(error.status).json({
            error: true,
            message: 'Error uploading image'
        });
    }
};
const deleteDropboxImages = async (req, res)=>{
    const { images = [], folders = [] } = req.body;
    if (!dbx.auth.getAccessToken()) {
        ;
        dbx.auth.setAccessToken(req.app.locals.dropboxAccessToken);
    }
    const entries = [];
    const imagesToDelete = [];
    if (folders.length === 0) {
        for (const img of images){
            const image = await _Image.default.findById(img.id).lean();
            if (image) {
                imagesToDelete.push(image);
                entries.push({
                    path: image.path
                });
            }
        }
    } else {
        folders.forEach((element)=>{
            entries.push({
                path: element
            });
        });
    }
    try {
        const filesDelete = await deleteImage(entries);
        let retry = 20;
        while(retry){
            const job = await checkDeleteBatch({
                async_job_id: filesDelete.async_job_id
            });
            if (job.result['.tag'] === 'complete') {
                retry = 0;
            } else {
                await (0, _utils.sleep)(1000);
                retry -= 1;
            }
        }
        for (const img of imagesToDelete){
            if (img.cloudflareUrl) {
                await deleteImageFromCloudflare(img);
            }
            await _Image.default.findByIdAndDelete(img._id);
        }
        res.status(200).json({
            success: true
        });
    } catch (error) {
        if (error.status === 401) {
            return await deleteDropboxImages(req, res);
        }
        res.status(error.status).json({
            error: true,
            message: 'Error deleting image'
        });
    }
};
const moveImagesToDeletedFolder = async (req, res)=>{
    const { images, slug } = req.body;
    if (!dbx.auth.getAccessToken()) {
        ;
        dbx.auth.setAccessToken(req.app.locals.dropboxAccessToken);
    }
    const deleteImages = [];
    const databaseImages = [];
    try {
        for (const img of images){
            const image = await _Image.default.findById(img.id).lean();
            if (image) {
                databaseImages.push(image);
                deleteImages.push({
                    path: image.path
                });
            }
        }
        const entries = prepareImagesEntries(deleteImages, slug, 'Delete Folder');
        const filesMove = await moveImage({
            entries
        });
        let retry = 20;
        while(retry){
            const job = await checkMoveBatch({
                async_job_id: filesMove.async_job_id
            });
            if (job.result['.tag'] === 'complete') {
                retry = 0;
            } else {
                await (0, _utils.sleep)(1000);
                retry -= 1;
            }
        }
        for (const img of databaseImages){
            await _Image.default.findByIdAndUpdate(img._id, {
                $set: {
                    path: entries.find((x)=>x.from_path === img.path)?.to_path
                }
            });
        }
        res.status(200).json({
            success: true
        });
    } catch (error) {
        if (error.status === 401) {
            return await moveImagesToDeletedFolder(req, res);
        }
        res.status(error.status).json({
            error: true,
            message: 'Error moving image'
        });
    }
};
const refreshToken = async ()=>{
    try {
        return await _axios.default.post('https://api.dropbox.com/oauth2/token', _querystring.stringify({
            refresh_token: process.env.DROPBOX_REFRESH_TOKEN,
            grant_type: 'refresh_token',
            client_id: process.env.DROPBOX_CLIENT_ID,
            client_secret: process.env.DROPBOX_APP_SECRET
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
    } catch (error) {
        console.log(error);
        return null;
    }
};
const handleDropboxError = async (error, dbx)=>{
    if (error.status === 401) {
        const token = await refreshToken();
        if (token?.data) {
            ;
            dbx.auth.setAccessToken(token.data.access_token);
        }
    }
    return null;
};
const prepareImagesEntries = (images, slug, path)=>{
    return images.map((image, index)=>{
        return {
            from_path: image.path,
            to_path: `/${path}/${slug}/${new Date().toISOString()}-${index}.jpg`
        };
    });
};

//# sourceMappingURL=dropbox.js.map