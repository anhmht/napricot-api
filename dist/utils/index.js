"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSearchObject = exports.getNextNumber = exports.callMoveImagesToDeletedFolder = exports.callDeleteImages = exports.callMoveAndGetLink = exports.getMissingFields = exports.sleep = void 0;
const axios_1 = __importDefault(require("axios"));
const sleep = (duration) => {
    return new Promise((resolve) => {
        setTimeout(resolve, duration);
    });
};
exports.sleep = sleep;
const getMissingFields = (data, fields) => {
    const fieldsArray = Object.keys(data);
    const missingFields = [];
    fields.forEach((field) => {
        if (!fieldsArray.includes(field) ||
            data[field] === undefined ||
            data[field] === null ||
            data[field] === '') {
            missingFields.push(field);
            return field;
        }
    });
    if (missingFields.length > 0)
        return missingFields.join(', ');
    return undefined;
};
exports.getMissingFields = getMissingFields;
const callMoveAndGetLink = async ({ slug, images, movePath, req }) => {
    try {
        return await axios_1.default.post(`https://${req.get('host')}/images/move`, {
            slug,
            images,
            movePath
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
    catch (error) {
        console.log(error);
    }
};
exports.callMoveAndGetLink = callMoveAndGetLink;
const callDeleteImages = async ({ images, folders, req }) => {
    try {
        return await axios_1.default.post(`https://${req.get('host')}/images/delete`, {
            images,
            folders
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
    catch (error) {
        console.log(error);
    }
};
exports.callDeleteImages = callDeleteImages;
const callMoveImagesToDeletedFolder = async ({ images, slug, req }) => {
    try {
        return await axios_1.default.post(`https://${req.get('host')}/images/move-to-deleted-folder`, {
            images,
            slug
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
    catch (error) {
        console.log(error);
    }
};
exports.callMoveImagesToDeletedFolder = callMoveImagesToDeletedFolder;
const getNextNumber = (arr) => {
    if (arr.length === 0)
        return 0;
    const result = arr.map((item) => {
        if (!item)
            return 0;
        const link = item.split('?')[0];
        const image = link.split('/')[link.split('/').length - 1];
        const name = image.split('.')[0];
        return Number(name.split('-')[name.split('-').length - 1]);
    });
    return Math.max(...result) + 1;
};
exports.getNextNumber = getNextNumber;
const createSearchObject = ({ searchLikeObject, searchEqualObject, searchInObject, searchRangeObject }) => {
    const searchObject = {};
    if (!searchLikeObject)
        searchLikeObject = {};
    if (!searchEqualObject)
        searchEqualObject = {};
    if (!searchInObject)
        searchInObject = {};
    if (!searchRangeObject)
        searchRangeObject = {};
    for (const [key, value] of Object.entries(searchLikeObject)) {
        if (!value)
            continue;
        searchObject[key] = {
            $regex: new RegExp(`.*${value}.*`, 'i')
        };
    }
    for (const [key, value] of Object.entries(searchEqualObject)) {
        if (!value)
            continue;
        searchObject[key] = value;
    }
    for (const [key, value] of Object.entries(searchInObject)) {
        if (!value)
            continue;
        searchObject[key] = {
            $in: value
        };
    }
    for (const [key, value] of Object.entries(searchRangeObject)) {
        if (!value)
            continue;
        searchObject[key] = {
            $gte: value.from,
            $lte: value.to
        };
    }
    return searchObject;
};
exports.createSearchObject = createSearchObject;
