const mongoose = require('mongoose');
const baseUserSchema = require('./baseUser');

// Admin-specific schema - extend baseUserSchema
const adminSchema = new mongoose.Schema({
  // Base user fields
  username: { 
    type: String, 
    required: false,
    trim: true,
    default: ''
  },
  firstName: {
    type: String,
    trim: true,
    default: ''
  },
  lastName: {
    type: String,
    trim: true,
    default: ''
  },
  email: { 
    type: String, 
    required: true,
    unique: true,
    lowercase: true
  },   
  password: { 
    type: String, 
    required: true,
    select: false
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Notifications
  notifications: [{
    id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()
    },
    title: String,
    message: String,
    type: {
      type: String,
      enum: ['payment', 'warning', 'update', 'success', 'error', 'info'],
      default: 'info'
    },
    details: String,
    actions: [String],
    deadline: Date,
    sentAt: {
      type: Date,
      default: Date.now
    },
    readAt: Date,
    isRead: {
      type: Boolean,
      default: false
    }
  }],
  // Profile and preferences
  profilePicture: {
    type: String,
    default: ''
  },
  // Security and tracking
  lastLogin: {
    type: Date,
    default: null
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  },
  passwordChangedAt: {
    type: Date,
    default: null
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  
  // Admin information
  adminId: {
    type: String,
    unique: true,
    sparse: true
  },
  // Admin role and level
  adminLevel: {
    type: String,
    enum: ['super_admin', 'admin', 'moderator', 'support_admin'],
    default: 'admin'
  },
  // Super admin flag for emergency access
  superadmin: {
    type: Boolean,
    default: false
  },
  // Admin permissions
  permissions: [{
    resource: {
      type: String,
      enum: ['products', 'categories', 'orders', 'users', 'analytics', 'settings', 'admin_management', 'business_management', 'system_config', 'reports', 'security', 'billing']
    },
    actions: [{
      type: String,
      enum: ['read', 'create', 'update', 'delete', 'manage', 'approve', 'suspend', 'restore', 'configure', 'audit']
    }]
  }],
  // Admin metrics
  metrics: {
    usersManaged: { type: Number, default: 0 },
    businessesManaged: { type: Number, default: 0 },
    actionsPerformed: { type: Number, default: 0 },
    lastActionDate: Date,
    performanceRating: { type: Number, min: 1, max: 5, default: 3 },
    lastReviewDate: Date
  },
  // Admin responsibilities
  responsibilities: [{
    type: {
      type: String,
      enum: ['user_management', 'business_verification', 'content_moderation', 'system_maintenance', 'security_monitoring', 'billing_support', 'technical_support']
    },
    isActive: { type: Boolean, default: true },
    assignedAt: { type: Date, default: Date.now },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    }
  }],
  // Admin settings
  adminSettings: {
    canManageUsers: { type: Boolean, default: true },
    canManageBusinesses: { type: Boolean, default: true },
    canManageAdmins: { type: Boolean, default: false },
    canViewSystemLogs: { type: Boolean, default: false },
    canModifySystemConfig: { type: Boolean, default: false },
    canAccessFinancialData: { type: Boolean, default: false },
    canManageSecurity: { type: Boolean, default: false },
    canPerformAudits: { type: Boolean, default: false },
    canManageBilling: { type: Boolean, default: false },
    canViewAnalytics: { type: Boolean, default: true }
  },
  // Admin access and security
  accessControl: {
    ipWhitelist: [String],
    allowedDevices: [{
      deviceId: String,
      deviceName: String,
      lastUsed: Date,
      isActive: { type: Boolean, default: true }
    }],
    sessionTimeout: { type: Number, default: 3600 }, // in seconds
    requireTwoFactor: { type: Boolean, default: false },
    twoFactorSecret: String,
    lastPasswordChange: { type: Date, default: Date.now },
    passwordExpiryDays: { type: Number, default: 90 }
  },
  // Admin activity log
  activityLog: [{
    action: {
      type: String,
      enum: ['login', 'logout', 'user_created', 'user_updated', 'user_deleted', 'business_verified', 'business_suspended', 'admin_action', 'system_config', 'security_event']
    },
    target: {
      type: String,
      enum: ['user', 'business', 'system', 'admin', 'other']
    },
    targetId: mongoose.Schema.Types.ObjectId,
    details: String,
    timestamp: { type: Date, default: Date.now },
    ipAddress: String,
    userAgent: String,
    success: { type: Boolean, default: true },
    changes: mongoose.Schema.Types.Mixed
  }],
  // Admin performance
  performance: {
    kpis: [{
      name: String,
      target: Number,
      actual: Number,
      period: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly']
      },
      lastUpdated: { type: Date, default: Date.now }
    }],
    goals: [{
      title: String,
      description: String,
      targetDate: Date,
      status: {
        type: String,
        enum: ['not_started', 'in_progress', 'completed', 'overdue'],
        default: 'not_started'
      },
      progress: { type: Number, min: 0, max: 100, default: 0 },
      createdAt: { type: Date, default: Date.now }
    }]
  },
  // Admin status
  adminStatus: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'on_leave', 'training'],
    default: 'active'
  },
  // Reporting structure
  reportsTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  },
  directReports: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }],
  // Admin notes and history
  adminNotes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  },
  // Emergency contact
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    email: String
  }
}, {
  timestamps: true
});

// Set role to admin
adminSchema.add({
  role: {
    type: String,
    default: 'admin',
    enum: ['admin']
  },
  isAdmin: {
    type: Boolean,
    default: true
  }
});

// Generate admin ID on creation
adminSchema.pre('save', function(next) {
  if (this.isNew && !this.adminId) {
    this.adminId = 'ADM-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  next();
});

// Pre-save middleware to set default permissions based on admin level
adminSchema.pre('save', function(next) {
  if (this.isNew && (!this.permissions || this.permissions.length === 0)) {
    const defaultPermissions = this.getDefaultPermissionsByLevel();
    this.permissions = defaultPermissions;
  }
  next();
});

// Method to get default permissions by admin level
adminSchema.methods.getDefaultPermissionsByLevel = function() {
  const basePermissions = [
    { resource: 'products', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'categories', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'orders', actions: ['read', 'update'] },
    { resource: 'users', actions: ['read', 'update'] },
    { resource: 'analytics', actions: ['read'] },
    { resource: 'settings', actions: ['read', 'update'] }
  ];

  switch (this.adminLevel) {
    case 'super_admin':
      return [
        ...basePermissions,
        { resource: 'admin_management', actions: ['read', 'create', 'update', 'delete', 'manage'] },
        { resource: 'business_management', actions: ['read', 'create', 'update', 'delete', 'manage', 'approve', 'suspend'] },
        { resource: 'system_config', actions: ['read', 'create', 'update', 'delete', 'configure'] },
        { resource: 'reports', actions: ['read', 'create', 'update', 'delete', 'manage'] },
        { resource: 'security', actions: ['read', 'create', 'update', 'delete', 'manage', 'audit'] },
        { resource: 'billing', actions: ['read', 'create', 'update', 'delete', 'manage'] }
      ];
    case 'admin':
      return [
        ...basePermissions,
        { resource: 'admin_management', actions: ['read', 'create', 'update'] },
        { resource: 'business_management', actions: ['read', 'create', 'update', 'approve'] },
        { resource: 'reports', actions: ['read', 'create', 'update'] },
        { resource: 'security', actions: ['read', 'update'] }
      ];
    case 'moderator':
      return [
        ...basePermissions,
        { resource: 'business_management', actions: ['read', 'update'] },
        { resource: 'reports', actions: ['read', 'create'] }
      ];
    case 'support_admin':
      return [
        ...basePermissions,
        { resource: 'users', actions: ['read', 'update', 'delete'] },
        { resource: 'orders', actions: ['read', 'update', 'delete'] }
      ];
    default:
      return basePermissions;
  }
};

// Method to log admin activity
adminSchema.methods.logActivity = function(action, target, targetId, details, success = true, changes = null) {
  this.activityLog.push({
    action,
    target,
    targetId,
    details,
    success,
    changes,
    timestamp: new Date()
  });

  // Keep only last 1000 log entries
  if (this.activityLog.length > 1000) {
    this.activityLog = this.activityLog.slice(-1000);
  }

  this.metrics.actionsPerformed += 1;
  this.metrics.lastActionDate = new Date();

  return this.save();
};

// Method to add responsibility
adminSchema.methods.addResponsibility = function(type, assignedBy = null) {
  this.responsibilities.push({
    type,
    assignedBy
  });
  return this.save();
};

// Method to remove responsibility
adminSchema.methods.removeResponsibility = function(type) {
  this.responsibilities = this.responsibilities.filter(resp => resp.type !== type);
  return this.save();
};

// Add baseUserSchema methods and middleware
const bcrypt = require('bcryptjs');
const sanitize = require('mongoose-sanitize');

// Apply sanitization
adminSchema.plugin(sanitize);

// Virtual for full name
adminSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`.trim();
});

// Virtual for display name
adminSchema.virtual('displayName').get(function() {
  return this.username || this.fullName || this.email;
});

// Pre-save middleware for password hashing
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordChangedAt = Date.now() - 1000; // 1 second ago
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to check if account is locked
adminSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Method to increment login attempts
adminSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }
  
  return this.updateOne(updates);
};

// Method to check if admin can perform action
adminSchema.methods.canPerformAction = function(resource, action) {
  if (this.adminStatus !== 'active') return false;

  const permission = this.permissions.find(p => p.resource === resource);
  if (!permission) return false;

  return permission.actions.includes(action);
};

// Method to check if admin is super admin
adminSchema.methods.isSuperAdmin = function() {
  return this.adminLevel === 'super_admin';
};

// Method to check if admin can manage other admins
adminSchema.methods.canManageAdmins = function() {
  return this.adminSettings.canManageAdmins && 
         (this.adminLevel === 'super_admin' || this.adminLevel === 'admin');
};

// Method to check if admin can manage businesses
adminSchema.methods.canManageBusinesses = function() {
  return this.adminSettings.canManageBusinesses && 
         (this.adminLevel === 'super_admin' || this.adminLevel === 'admin' || this.adminLevel === 'moderator');
};

// Method to check if admin can view system logs
adminSchema.methods.canViewSystemLogs = function() {
  return this.adminSettings.canViewSystemLogs && 
         (this.adminLevel === 'super_admin' || this.adminLevel === 'admin');
};

// Method to check if admin can modify system config
adminSchema.methods.canModifySystemConfig = function() {
  return this.adminSettings.canModifySystemConfig && 
         this.adminLevel === 'super_admin';
};

// Method to check if admin can access financial data
adminSchema.methods.canAccessFinancialData = function() {
  return this.adminSettings.canAccessFinancialData && 
         (this.adminLevel === 'super_admin' || this.adminLevel === 'admin');
};

// Method to check if admin can manage security
adminSchema.methods.canManageSecurity = function() {
  return this.adminSettings.canManageSecurity && 
         this.adminLevel === 'super_admin';
};

// Method to check if admin can perform audits
adminSchema.methods.canPerformAudits = function() {
  return this.adminSettings.canPerformAudits && 
         (this.adminLevel === 'super_admin' || this.adminLevel === 'admin');
};

// Method to check if admin can manage billing
adminSchema.methods.canManageBilling = function() {
  return this.adminSettings.canManageBilling && 
         (this.adminLevel === 'super_admin' || this.adminLevel === 'admin');
};

// Method to update performance KPI
adminSchema.methods.updateKPI = function(kpiName, actualValue) {
  const kpi = this.performance.kpis.find(k => k.name === kpiName);
  if (kpi) {
    kpi.actual = actualValue;
    kpi.lastUpdated = new Date();
  }
  return this.save();
};

// Method to add goal
adminSchema.methods.addGoal = function(goalData) {
  this.performance.goals.push(goalData);
  return this.save();
};

// Method to update goal progress
adminSchema.methods.updateGoalProgress = function(goalId, progress) {
  const goal = this.performance.goals.id(goalId);
  if (goal) {
    goal.progress = progress;
    if (progress >= 100) {
      goal.status = 'completed';
    }
  }
  return this.save();
};

// Method to check if admin needs password change
adminSchema.methods.needsPasswordChange = function() {
  const daysSinceChange = (Date.now() - this.accessControl.lastPasswordChange) / (1000 * 60 * 60 * 24);
  return daysSinceChange >= this.accessControl.passwordExpiryDays;
};

// Method to update password change date
adminSchema.methods.updatePasswordChange = function() {
  this.accessControl.lastPasswordChange = new Date();
  return this.save();
};

module.exports = mongoose.model('Admin', adminSchema);
