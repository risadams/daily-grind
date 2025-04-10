const jwt = require('jsonwebtoken');
const passport = require('passport');
const { JWT_SECRET } = require('../config/auth/passport');

// Generate JWT token for authenticated users
const generateToken = (user) => {
  const payload = {
    sub: user._id,
    email: user.email,
    iat: Date.now()
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

// Middleware to authenticate JWT token
const authenticateJWT = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
    }
    
    req.user = user;
    next();
  })(req, res, next);
};

// Middleware to verify current user
const isCurrentUser = (req, res, next) => {
  if (req.params.userId !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Forbidden: You are not authorized to access this resource' });
  }
  next();
};

// Middleware to check if user is admin
// TEMPORARY: All authenticated users are considered admins
const isAdmin = (req, res, next) => {
  // For now, all authenticated users are considered admins
  if (!req.user) {
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
  // Skip the isAdmin check and proceed
  next();
};

module.exports = {
  generateToken,
  authenticateJWT,
  isCurrentUser,
  isAdmin // Add isAdmin to exports
};