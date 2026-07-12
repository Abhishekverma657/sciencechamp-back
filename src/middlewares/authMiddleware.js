const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Add user/admin info to request
            req.user = decoded; // Will contain id and role
            
            return next(); // ADDED return here just to be safe
        } catch (error) {
            console.error(error);
            return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        console.log(`[AuthMiddleware] No token found for ${req.method} ${req.originalUrl}`);
        console.log('Headers:', req.headers);
        return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};

const adminProtect = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ success: false, message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, adminProtect };
