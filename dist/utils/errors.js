/**
 * Centralized error handling utilities
 * Provides custom error classes for better error classification and handling
 */ "use strict";
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
    get BadRequestError () {
        return BadRequestError;
    },
    get ForbiddenError () {
        return ForbiddenError;
    },
    get HttpError () {
        return HttpError;
    },
    get NotFoundError () {
        return NotFoundError;
    },
    get UnauthorizedError () {
        return UnauthorizedError;
    },
    get ValidationError () {
        return ValidationError;
    },
    get default () {
        return _default;
    },
    get errorHandler () {
        return errorHandler;
    }
});
const _logger = /*#__PURE__*/ _interop_require_default(require("./logger"));
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
class HttpError extends Error {
    constructor(message, statusCode = 500){
        super(message), _define_property(this, "statusCode", void 0);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}
class BadRequestError extends HttpError {
    constructor(message = 'Bad request'){
        super(message, 400);
    }
}
class UnauthorizedError extends HttpError {
    constructor(message = 'Unauthorized'){
        super(message, 401);
    }
}
class ForbiddenError extends HttpError {
    constructor(message = 'Forbidden'){
        super(message, 403);
    }
}
class NotFoundError extends HttpError {
    constructor(message = 'Resource not found'){
        super(message, 404);
    }
}
class ValidationError extends HttpError {
    constructor(message = 'Validation error', field){
        super(message, 400), _define_property(this, "field", void 0);
        this.field = field;
    }
}
const errorHandler = (err, req, res, next)=>{
    const statusCode = 'statusCode' in err ? err.statusCode : 500;
    const field = 'field' in err ? err.field : undefined;
    _logger.default.error(`${statusCode} error:`, err);
    const response = {
        error: true,
        message: err.message || 'Internal server error'
    };
    if (field) {
        response.field = field;
    }
    if (process.env.NODE_ENV === 'development' && err.stack) {
        response.stack = err.stack;
    }
    res.status(statusCode).json(response);
};
const _default = {
    HttpError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ValidationError,
    errorHandler
};

//# sourceMappingURL=errors.js.map