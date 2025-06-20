"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const authorize = (req, res, next) => {
    if (!res.locals.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    if (!res.locals.user.isVerified) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    if (!res.locals.user.roles.includes('admin') &&
        !res.locals.user.roles.includes('superadmin')) {
        res.status(401).json({ error: 'Not Permitted' });
        return;
    }
    next();
};
exports.authorize = authorize;
