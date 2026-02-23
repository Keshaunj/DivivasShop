const jwt = require('jsonwebtoken');
const User = require('../../models/users');

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

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

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

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        message: 'User not found'
      });
    }

    // Flatten admin profile for middleware that expects permissions / adminLevel on user
    if (user.role === 'admin' || user.isAdmin) {
      if (!user.permissions && user.adminProfile) {
        user.permissions = user.adminProfile.permissions || [];
      }
      if (!user.adminLevel && user.adminProfile) {
        user.adminLevel = user.adminProfile.adminLevel || (user.isAdmin ? 'super_admin' : 'standard');
      }
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

const authenticateAdminToken = async (req, res, next) => {
  try {
    const token = req.cookies.adminToken || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'Admin authentication required'
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        message: 'Invalid admin token'
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        message: 'Admin user not found'
      });
    }

    if (user.role !== 'admin' && !user.isAdmin) {
      return res.status(401).json({
        message: 'Admin access required'
      });
    }

    user.role = 'admin';
    user.isAdmin = true;
    user.permissions = user.adminProfile?.permissions || [];
    user.adminLevel = user.adminProfile?.adminLevel || 'admin';

    req.user = user;
    next();
  } catch (error) {
    console.error('Admin token verification error:', error);
    res.status(401).json({
      message: 'Admin authentication failed'
    });
  }
};

module.exports = {
  generateToken,
  verifyToken,
  authenticateToken,
  authenticateAdminToken
};
