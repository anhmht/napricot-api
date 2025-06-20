"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const errorHandler = (err, req, res, next)=>{
    const statusCode = (err.statusCode ?? res.statusCode) || 500;
    res.status(statusCode).json({
        message: err.message || 'Internal Server Error'
    });
};
const _default = errorHandler;

//# sourceMappingURL=error.js.map