const authMiddleware = require('./authMiddleware');
const {
    roleGuard,
    adminOnly,
    clientOnly,
    freelancerOnly,
    clientOrAdmin,
    freelancerOrAdmin,
    anyAuthenticated
} = require('./roleGuard');

module.exports = {
    authMiddleware,
    roleGuard,
    adminOnly,
    clientOnly,
    freelancerOnly,
    clientOrAdmin,
    freelancerOrAdmin,
    anyAuthenticated
};