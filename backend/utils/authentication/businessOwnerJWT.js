const jwt = require('jsonwebtoken');
const { BusinessOwner } = require('../../models/users');

// Authenticate business owner token middleware
const authenticateBusinessOwnerToken = async (req, res, next) => {
  try {
    const token = req.cookies.businessOwnerToken || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'Business owner authentication required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if business owner exists and is active
    const businessOwner = await BusinessOwner.findById(decoded.id);
    
    if (!businessOwner) {
      return res.status(401).json({
        message: 'Business owner not found'
      });
    }

    if (!businessOwner.isActive || businessOwner.status === 'suspended') {
      return res.status(401).json({
        message: 'Business owner account is suspended or inactive'
      });
    }

    // Add business owner info to request
    req.businessOwner = {
      id: businessOwner._id,
      email: businessOwner.email,
      businessName: businessOwner.businessName,
      accessLevel: businessOwner.accessLevel,
      isSuperAdmin: businessOwner.isSuperAdmin
    };

    next();
  } catch (error) {
    console.error('Business owner token verification error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: 'Invalid business owner token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Business owner token expired'
      });
    }

    res.status(500).json({
      message: 'Business owner authentication failed'
    });
  }
};

// Generate business owner token
const generateBusinessOwnerToken = (businessOwner) => {
  return jwt.sign(
    {
      id: businessOwner._id,
      email: businessOwner.email,
      businessName: businessOwner.businessName,
      accessLevel: businessOwner.accessLevel,
      isSuperAdmin: businessOwner.isSuperAdmin
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Verify business owner token without database check (for performance)
const verifyBusinessOwnerToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  authenticateBusinessOwnerToken,
  generateBusinessOwnerToken,
  verifyBusinessOwnerToken
}; 