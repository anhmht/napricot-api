/**
 * Application-wide constants for consistent usage
 */ // HTTP status codes
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
    get CONTENT_STATUS () {
        return CONTENT_STATUS;
    },
    get FILE_LIMITS () {
        return FILE_LIMITS;
    },
    get HTTP_STATUS () {
        return HTTP_STATUS;
    },
    get PRODUCT_TYPES () {
        return PRODUCT_TYPES;
    },
    get REGEX () {
        return REGEX;
    },
    get USER_ROLES () {
        return USER_ROLES;
    },
    get default () {
        return _default;
    }
});
const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
};
const FILE_LIMITS = {
    MAX_FILE_SIZE: 10 * 1024 * 1024,
    IMAGE_TYPES: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp'
    ]
};
const USER_ROLES = {
    USER: 'user',
    ADMIN: 'admin',
    SUPERADMIN: 'superadmin'
};
const PRODUCT_TYPES = {
    CLOTHING: 'clothing',
    ACCESSORIES: 'accessories',
    DIGITAL: 'digital'
};
const CONTENT_STATUS = {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    DELETED: 'deleted'
};
const REGEX = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
};
const _default = {
    HTTP_STATUS,
    FILE_LIMITS,
    USER_ROLES,
    PRODUCT_TYPES,
    CONTENT_STATUS,
    REGEX
};

//# sourceMappingURL=constants.js.map