const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    // Check if Authorization header exists
    if (!authHeader) {
        return res.status(401).json({ 
            error: 'Authentication required', 
            message: 'No token provided' 
        });
    }

    // Extract token (remove "Bearer " prefix)
    const token = authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ 
            error: 'Authentication required', 
            message: 'Invalid token format' 
        });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attach user to request
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role
        };
        
        // Go to next middleware/route
        next();
    } catch (error) {
        // Handle specific errors
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                error: 'Authentication failed', 
                message: 'Invalid token' 
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                error: 'Authentication failed', 
                message: 'Token expired' 
            });
        }
        
        // Generic error
        return res.status(401).json({ 
            error: 'Authentication failed', 
            message: error.message 
        });
    }
};

module.exports = authMiddleware;