"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRange = exports.validateSlug = exports.validateEmail = exports.validateRequiredFields = void 0;
const errors_1 = require("./errors");
const constants_1 = require("./constants");
/**
 * Validates that all required fields are present
 * @param data Object to validate
 * @param requiredFields Array of required field names
 * @throws ValidationError if any required field is missing
 */
const validateRequiredFields = (data, requiredFields) => {
    const missingFields = requiredFields.filter((field) => !data[field] ||
        data[field] === undefined ||
        data[field] === null ||
        data[field] === '');
    if (missingFields.length > 0) {
        throw new errors_1.ValidationError(`${missingFields.join(', ')} is required`, missingFields[0]);
    }
};
exports.validateRequiredFields = validateRequiredFields;
/**
 * Validates an email address
 * @param email Email to validate
 * @throws ValidationError if email is invalid
 */
const validateEmail = (email) => {
    if (!constants_1.REGEX.EMAIL.test(email)) {
        throw new errors_1.ValidationError('Invalid email format', 'email');
    }
};
exports.validateEmail = validateEmail;
/**
 * Validates a slug
 * @param slug Slug to validate
 * @throws ValidationError if slug is invalid
 */
const validateSlug = (slug) => {
    if (!constants_1.REGEX.SLUG.test(slug)) {
        throw new errors_1.ValidationError('Slug must contain only lowercase letters, numbers, and hyphens', 'slug');
    }
};
exports.validateSlug = validateSlug;
/**
 * Validates a value is within a numeric range
 * @param value Value to validate
 * @param min Minimum allowed value
 * @param max Maximum allowed value
 * @param fieldName Field name for error messages
 * @throws ValidationError if value is outside of range
 */
const validateRange = (value, min, max, fieldName) => {
    if (value < min || value > max) {
        throw new errors_1.ValidationError(`${fieldName} must be between ${min} and ${max}`, fieldName);
    }
};
exports.validateRange = validateRange;
exports.default = {
    validateRequiredFields: exports.validateRequiredFields,
    validateEmail: exports.validateEmail,
    validateSlug: exports.validateSlug,
    validateRange: exports.validateRange
};
