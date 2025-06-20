"use strict";
/**
 * Application-wide constants for consistent usage
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.REGEX = exports.CONTENT_STATUS = exports.PRODUCT_TYPES = exports.USER_ROLES = exports.FILE_LIMITS = exports.HTTP_STATUS = void 0;
// HTTP status codes
exports.HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
};
// File upload limits
exports.FILE_LIMITS = {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
};
// User roles
exports.USER_ROLES = {
    USER: 'user',
    ADMIN: 'admin',
    SUPERADMIN: 'superadmin'
};
// Product types
exports.PRODUCT_TYPES = {
    CLOTHING: 'clothing',
    ACCESSORIES: 'accessories',
    DIGITAL: 'digital'
};
// Content statuses
exports.CONTENT_STATUS = {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    DELETED: 'deleted'
};
// Regex patterns
exports.REGEX = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
};
exports.default = {
    HTTP_STATUS: exports.HTTP_STATUS,
    FILE_LIMITS: exports.FILE_LIMITS,
    USER_ROLES: exports.USER_ROLES,
    PRODUCT_TYPES: exports.PRODUCT_TYPES,
    CONTENT_STATUS: exports.CONTENT_STATUS,
    REGEX: exports.REGEX
};
