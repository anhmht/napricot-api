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
    get default () {
        return _default;
    },
    get validateEmail () {
        return validateEmail;
    },
    get validateRange () {
        return validateRange;
    },
    get validateRequiredFields () {
        return validateRequiredFields;
    },
    get validateSlug () {
        return validateSlug;
    }
});
const _errors = require("./errors");
const _constants = require("./constants");
const validateRequiredFields = (data, requiredFields)=>{
    const missingFields = requiredFields.filter((field)=>!data[field] || data[field] === undefined || data[field] === null || data[field] === '');
    if (missingFields.length > 0) {
        throw new _errors.ValidationError(`${missingFields.join(', ')} is required`, missingFields[0]);
    }
};
const validateEmail = (email)=>{
    if (!_constants.REGEX.EMAIL.test(email)) {
        throw new _errors.ValidationError('Invalid email format', 'email');
    }
};
const validateSlug = (slug)=>{
    if (!_constants.REGEX.SLUG.test(slug)) {
        throw new _errors.ValidationError('Slug must contain only lowercase letters, numbers, and hyphens', 'slug');
    }
};
const validateRange = (value, min, max, fieldName)=>{
    if (value < min || value > max) {
        throw new _errors.ValidationError(`${fieldName} must be between ${min} and ${max}`, fieldName);
    }
};
const _default = {
    validateRequiredFields,
    validateEmail,
    validateSlug,
    validateRange
};

//# sourceMappingURL=validation.js.map