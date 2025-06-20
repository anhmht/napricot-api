"use strict";
/**
 * Centralized error handling utilities
 * Provides custom error classes for better error classification and handling
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.ValidationError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.BadRequestError = exports.HttpError = void 0;
class HttpError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.HttpError = HttpError;
class BadRequestError extends HttpError {
    constructor(message = 'Bad request') {
        super(message, 400);
    }
}
exports.BadRequestError = BadRequestError;
class UnauthorizedError extends HttpError {
    constructor(message = 'Unauthorized') {
        super(message, 401);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends HttpError {
    constructor(message = 'Forbidden') {
        super(message, 403);
    }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends HttpError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}
exports.NotFoundError = NotFoundError;
class ValidationError extends HttpError {
    constructor(message = 'Validation error', field) {
        super(message, 400);
        this.field = field;
    }
}
exports.ValidationError = ValidationError;
const logger_1 = __importDefault(require("./logger"));
const errorHandler = (err, req, res, next) => {
    const statusCode = 'statusCode' in err ? err.statusCode : 500;
    const field = 'field' in err ? err.field : undefined;
    logger_1.default.error(`${statusCode} error:`, err);
    res.status(statusCode).json({
        error: true,
        message: err.message || 'Internal server error',
        ...(field && { field }),
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};
exports.errorHandler = errorHandler;
exports.default = {
    HttpError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ValidationError,
    errorHandler: exports.errorHandler
};
