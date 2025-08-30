const User = require('../models/users');

// Permission checking middleware
const checkPermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      // Super admin bypass (role === 'admin' and isAdmin === true)
      if (req.user.role === 'admin' && req.user.isAdmin) {
        return next();
      }

      // Check if user has the required permission
      const hasPermission = req.user.permissions?.some(permission => 
        permission.resource === resource && 
        permission.actions.includes(action)
      );

      if (!hasPermission) {
        return res.status(403).json({ 
          message: `Access denied. Required permission: ${resource}:${action}` 
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ message: 'Permission check failed' });
    }
  };
};

// Check if user can manage a specific resource
const canManage = (resource) => {
  return checkPermission(resource, 'manage');
};

// Check if user can read a specific resource
const canRead = (resource) => {
  return checkPermission(resource, 'read');
};

// Check if user can create a specific resource
const canCreate = (resource) => {
  return checkPermission(resource, 'create');
};

// Check if user can update a specific resource
const canUpdate = (resource) => {
  return checkPermission(resource, 'update');
};

// Check if user can delete a specific resource
const canDelete = (resource) => {
  return checkPermission(resource, 'delete');
};

// Check if user is admin (has admin_management permissions)
const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    console.log('🔍 Admin check - User:', {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role,
      isAdmin: req.user.isAdmin,
      userType: req.user.userType,
      modelName: req.user.constructor.modelName
    });

    // Super admin from Admin collection
    if (req.user.role === 'admin' || req.user.isAdmin === true) {
      console.log('✅ Super admin access granted');
      return next();
    }

    // Check if user is from Admin collection (corporate portal users)
    if (req.user.userType === 'admin' || req.user.constructor.modelName === 'Admin') {
      console.log('✅ Admin collection user access granted');
      return next();
    }

    // Check if user has admin management permissions
    const hasAdminPermission = req.user.permissions?.some(permission => 
      permission.resource === 'admin_management' && 
      permission.actions.includes('read')
    );

    if (hasAdminPermission) {
      console.log('✅ Admin permission access granted');
      return next();
    }

    console.log('❌ Admin access denied - no valid admin credentials');
    return res.status(403).json({ message: 'Admin access required' });
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ message: 'Admin check failed' });
  }
};

// Check if user can manage other users
const canManageUsers = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Super admin
    if (req.user.role === 'admin' && req.user.isAdmin) {
      return next();
    }

    // Check if user has user management permissions
    const hasUserPermission = req.user.permissions?.some(permission => 
      permission.resource === 'users' && 
      (permission.actions.includes('manage') || permission.actions.includes('update'))
    );

    if (!hasUserPermission) {
      return res.status(403).json({ message: 'User management access required' });
    }

    next();
  } catch (error) {
    console.error('User management check error:', error);
    res.status(500).json({ message: 'User management check failed' });
  }
};

module.exports = {
  checkPermission,
  canManage,
  canRead,
  canCreate,
  canUpdate,
  canDelete,
  isAdmin,
  canManageUsers
};

