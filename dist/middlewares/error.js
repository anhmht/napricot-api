"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler = (err, req, res, next) => {
    const statusCode = (err.statusCode ?? res.statusCode) || 500;
    res.status(statusCode).json({
        message: err.message || 'Internal Server Error'
    });
};
exports.default = errorHandler;
