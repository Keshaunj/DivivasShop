const User = require('../models/users');

// Check if user has active subscription
const checkSubscription = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Admins always have access
    if (req.user.role === 'admin' || req.user.isAdmin) {
      return next();
    }

    // Check subscription status
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if access is revoked
    if (user.subscriptionStatus === 'revoked') {
      return res.status(403).json({ 
        message: 'Access revoked',
        reason: user.revocationReason || 'Payment overdue',
        revokedAt: user.accessRevokedAt
      });
    }

    // Check if subscription is inactive
    if (user.subscriptionStatus === 'inactive') {
      return res.status(403).json({ 
        message: 'Subscription inactive',
        expiry: user.subscriptionExpiry
      });
    }

    // Check if subscription has expired
    if (user.subscriptionExpiry && new Date() > user.subscriptionExpiry) {
      return res.status(403).json({ 
        message: 'Subscription expired',
        expiry: user.subscriptionExpiry
      });
    }

    // User has active subscription
    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({ message: 'Error checking subscription status' });
  }
};

// Check if user has admin privileges
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.role !== 'admin' && !req.user.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  next();
};

// Check if user has active subscription OR is admin
const requireActiveSubscription = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Admins always have access
    if (req.user.role === 'admin' || req.user.isAdmin) {
      return next();
    }

    // Check subscription status
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if subscription is active
    if (user.subscriptionStatus === 'active') {
      // Check if subscription has expired
      if (!user.subscriptionExpiry || new Date() <= user.subscriptionExpiry) {
        return next();
      }
    }

    // User doesn't have active subscription
    return res.status(403).json({ 
      message: 'Active subscription required',
      subscriptionStatus: user.subscriptionStatus,
      expiry: user.subscriptionExpiry
    });

  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({ message: 'Error checking subscription status' });
  }
};

module.exports = {
  checkSubscription,
  requireAdmin,
  requireActiveSubscription
}; 