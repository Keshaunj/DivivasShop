// Check if business owner is super admin
const isSuperAdmin = (req, res, next) => {
  if (!req.businessOwner) {
    return res.status(401).json({
      message: 'Business owner authentication required'
    });
  }

  if (!req.businessOwner.isSuperAdmin) {
    return res.status(403).json({
      message: 'Super admin access required'
    });
  }

  next();
};

// Check if business owner has specific access level
const hasAccessLevel = (requiredLevel) => {
  return (req, res, next) => {
    if (!req.businessOwner) {
      return res.status(401).json({
        message: 'Business owner authentication required'
      });
    }

    const accessLevels = {
      'owner': 3,
      'admin': 2,
      'manager': 1
    };

    const userLevel = accessLevels[req.businessOwner.accessLevel] || 0;
    const requiredLevelNum = accessLevels[requiredLevel] || 0;

    if (userLevel < requiredLevelNum) {
      return res.status(403).json({
        message: `${requiredLevel} access level required`
      });
    }

    next();
  };
};

// Check if business owner has active subscription
const hasActiveSubscription = (req, res, next) => {
  if (!req.businessOwner) {
    return res.status(401).json({
      message: 'Business owner authentication required'
    });
  }

  // This would typically check the business owner's subscription status
  // For now, we'll assume all authenticated business owners have active subscriptions
  next();
};

// Check if business owner can perform action based on limits
const checkBusinessOwnerLimits = (action) => {
  return async (req, res, next) => {
    if (!req.businessOwner) {
      return res.status(401).json({
        message: 'Business owner authentication required'
      });
    }

    // This would typically check against the business owner's plan limits
    // For now, we'll allow all actions
    next();
  };
};

module.exports = {
  isSuperAdmin,
  hasAccessLevel,
  hasActiveSubscription,
  checkBusinessOwnerLimits
}; 