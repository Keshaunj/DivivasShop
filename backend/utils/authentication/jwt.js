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

    // Get full user data from database across all collections
    const { Customer, BusinessOwner, Manager, Support, Viewer, Admin } = require('../../models/users');
    
    let user = await Customer.findById(decoded.id);
    if (!user) {
      user = await BusinessOwner.findById(decoded.id);
    }
    if (!user) {
      user = await Manager.findById(decoded.id);
    }
    if (!user) {
      user = await Support.findById(decoded.id);
    }
    if (!user) {
      user = await Viewer.findById(decoded.id);
    }
    if (!user) {
      user = await Admin.findById(decoded.id);
    }
    
    if (!user) {
      return res.status(401).json({
        message: 'User not found'
      });
    }

    // Ensure the user object has all necessary fields for admin operations
    // This is important for admin portal functionality
    if (user.role === 'admin' || user.isAdmin) {
      // Ensure admin users have the required fields
      if (!user.permissions) {
        user.permissions = [];
      }
      if (!user.adminLevel) {
        user.adminLevel = user.isAdmin ? 'super_admin' : 'standard';
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

// Authenticate admin token middleware for admin portal
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

    // Get full admin user data from database
    const { Admin } = require('../../models/users');
    
    let user = await Admin.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        message: 'Admin user not found'
      });
    }

    // Ensure the admin user object has all necessary fields for admin operations
    // Add role and isAdmin fields that the middleware expects
    user.role = 'admin'; // Admin users always have admin role
    user.isAdmin = true; // Admin users are always admins
    
    if (!user.permissions) {
      user.permissions = [];
    }
    if (!user.adminLevel) {
      user.adminLevel = 'admin';
    }

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