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
    get callDeleteImages () {
        return callDeleteImages;
    },
    get callMoveAndGetLink () {
        return callMoveAndGetLink;
    },
    get callMoveImagesToDeletedFolder () {
        return callMoveImagesToDeletedFolder;
    },
    get createSearchObject () {
        return createSearchObject;
    },
    get getMissingFields () {
        return getMissingFields;
    },
    get getNextNumber () {
        return getNextNumber;
    },
    get sleep () {
        return sleep;
    }
});
const _axios = /*#__PURE__*/ _interop_require_default(require("axios"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const sleep = (duration)=>{
    return new Promise((resolve)=>{
        setTimeout(resolve, duration);
    });
};
const getMissingFields = (data, fields)=>{
    const fieldsArray = Object.keys(data);
    const missingFields = [];
    fields.forEach((field)=>{
        if (!fieldsArray.includes(field) || data[field] === undefined || data[field] === null || data[field] === '') {
            missingFields.push(field);
            return field;
        }
    });
    if (missingFields.length > 0) return missingFields.join(', ');
    return undefined;
};
const callMoveAndGetLink = async ({ slug, images, movePath, req })=>{
    try {
        return await _axios.default.post(`https://${req.get('host')}/images/move`, {
            slug,
            images,
            movePath
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.log(error);
    }
};
const callDeleteImages = async ({ images, folders, req })=>{
    try {
        return await _axios.default.post(`https://${req.get('host')}/images/delete`, {
            images,
            folders
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.log(error);
    }
};
const callMoveImagesToDeletedFolder = async ({ images, slug, req })=>{
    try {
        return await _axios.default.post(`https://${req.get('host')}/images/move-to-deleted-folder`, {
            images,
            slug
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.log(error);
    }
};
const getNextNumber = (arr)=>{
    if (arr.length === 0) return 0;
    const result = arr.map((item)=>{
        if (!item) return 0;
        const link = item.split('?')[0];
        const image = link.split('/')[link.split('/').length - 1];
        const name = image.split('.')[0];
        return Number(name.split('-')[name.split('-').length - 1]);
    });
    return Math.max(...result) + 1;
};
const createSearchObject = ({ searchLikeObject, searchEqualObject, searchInObject, searchRangeObject })=>{
    const searchObject = {};
    if (!searchLikeObject) searchLikeObject = {};
    if (!searchEqualObject) searchEqualObject = {};
    if (!searchInObject) searchInObject = {};
    if (!searchRangeObject) searchRangeObject = {};
    for (const [key, value] of Object.entries(searchLikeObject)){
        if (!value) continue;
        searchObject[key] = {
            $regex: new RegExp(`.*${value}.*`, 'i')
        };
    }
    for (const [key, value] of Object.entries(searchEqualObject)){
        if (!value) continue;
        searchObject[key] = value;
    }
    for (const [key, value] of Object.entries(searchInObject)){
        if (!value) continue;
        searchObject[key] = {
            $in: value
        };
    }
    for (const [key, value] of Object.entries(searchRangeObject)){
        if (!value) continue;
        searchObject[key] = {
            $gte: value.from,
            $lte: value.to
        };
    }
    return searchObject;
};

//# sourceMappingURL=index.js.map