const jwt = require('jsonwebtoken');

// Generate JWT token for regular users
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      email: user.email,
      username: user.username,
      role: user.role,
      isAdmin: user.isAdmin
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Authenticate token middleware for regular users
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.cookies.jwt || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'Authentication required'
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        message: 'Invalid token'
      });
    }

    // Get full user data from database
    const User = require('../../models/users');
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        message: 'User not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      message: 'Authentication failed'
    });
  }
};

module.exports = {
  generateToken,
  verifyToken,
  authenticateToken
}; 