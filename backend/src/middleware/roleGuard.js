const roleGuard = (...allowedRoles) => {
    // Handle array input
    let roles = allowedRoles;
    if (allowedRoles.length === 1 && Array.isArray(allowedRoles[0])) {
        roles = allowedRoles[0];
    }

    return (req, res, next) => {
        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({ 
                error: 'Authentication required',
                message: 'User not authenticated'
            });
        }

        const userRole = req.user.role;
        
        // Check if user's role is allowed
        if (!roles.includes(userRole)) {
            return res.status(403).json({
                error: 'Access denied',
                message: `Role '${userRole}' does not have permission to access this resource`,
                requiredRoles: roles
            });
        }

        // Role is allowed, continue
        next();
    };
};

// Helper functions for common role checks
const adminOnly = roleGuard('admin');
const clientOnly = roleGuard('client');
const freelancerOnly = roleGuard('freelancer');
const clientOrAdmin = roleGuard('client', 'admin');
const freelancerOrAdmin = roleGuard('freelancer', 'admin');

// Check if user is authenticated (any role)
const anyAuthenticated = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
};

module.exports = {
    roleGuard,
    adminOnly,
    clientOnly,
    freelancerOnly,
    clientOrAdmin,
    freelancerOrAdmin,
    anyAuthenticated
};