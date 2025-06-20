"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "authorize", {
    enumerable: true,
    get: function() {
        return authorize;
    }
});
const authorize = (req, res, next)=>{
    if (!res.locals.user) {
        res.status(401).json({
            error: 'Unauthorized'
        });
        return;
    }
    if (!res.locals.user.isVerified) {
        res.status(401).json({
            error: 'Unauthorized'
        });
        return;
    }
    if (!res.locals.user.roles.includes('admin') && !res.locals.user.roles.includes('superadmin')) {
        res.status(401).json({
            error: 'Not Permitted'
        });
        return;
    }
    next();
};

//# sourceMappingURL=authorize.js.map