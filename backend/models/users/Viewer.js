const mongoose = require('mongoose');
const baseUserSchema = require('./baseUser');

// Viewer-specific schema (read-only access)
const viewerSchema = new mongoose.Schema({
  // Viewer information
  viewerId: {
    type: String,
    unique: true,
    sparse: true
  },
  // Viewer role and access level
  accessLevel: {
    type: String,
    enum: ['basic', 'standard', 'premium', 'enterprise'],
    default: 'basic'
  },
  // Viewer permissions (read-only)
  permissions: [{
    resource: {
      type: String,
      enum: ['products', 'categories', 'orders', 'customers', 'analytics', 'reports', 'knowledge_base']
    },
    actions: [{
      type: String,
      enum: ['read', 'export', 'download']
    }]
  }],
  // Viewer metrics
  metrics: {
    viewsCount: { type: Number, default: 0 },
    lastViewDate: Date,
    favoriteItems: [{
      type: {
        type: String,
        enum: ['product', 'category', 'report']
      },
      itemId: mongoose.Schema.Types.ObjectId,
      addedAt: { type: Date, default: Date.now }
    }],
    searchHistory: [{
      query: String,
      timestamp: { type: Date, default: Date.now },
      resultsCount: Number
    }]
  },
  // Viewer settings
  viewerSettings: {
    canExportData: { type: Boolean, default: false },
    canDownloadReports: { type: Boolean, default: false },
    canViewAnalytics: { type: Boolean, default: true },
    canViewCustomerData: { type: Boolean, default: false },
    canViewFinancialData: { type: Boolean, default: false },
    canViewInventoryLevels: { type: Boolean, default: true },
    canViewOrderDetails: { type: Boolean, default: false },
    canViewProductPricing: { type: Boolean, default: true }
  },
  // Data access restrictions
  restrictions: {
    dataRetentionDays: { type: Number, default: 30 },
    maxExportSize: { type: Number, default: 1000 }, // records
    allowedTimeRange: {
      start: { type: Date, default: () => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // 30 days ago
      end: { type: Date, default: Date.now }
    },
    restrictedFields: [String], // fields that cannot be viewed
    allowedCategories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    }],
    allowedProducts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }]
  },
  // Viewer preferences
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    language: {
      type: String,
      default: 'en'
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    pushNotifications: {
      type: Boolean,
      default: true
    },
    defaultView: {
      type: String,
      enum: ['dashboard', 'products', 'analytics', 'reports'],
      default: 'dashboard'
    },
    refreshInterval: {
      type: Number,
      default: 300, // 5 minutes in seconds
      min: 60,
      max: 3600
    },
    showNotifications: { type: Boolean, default: true },
    autoRefresh: { type: Boolean, default: false },
    compactView: { type: Boolean, default: false }
  },
  // Viewer status
  viewerStatus: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'expired'],
    default: 'active'
  },
  // Access tracking
  accessLog: [{
    action: {
      type: String,
      enum: ['login', 'logout', 'view', 'export', 'download', 'search']
    },
    resource: String,
    timestamp: { type: Date, default: Date.now },
    ipAddress: String,
    userAgent: String,
    success: { type: Boolean, default: true },
    details: String
  }],
  // Subscription and billing
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'standard', 'premium', 'enterprise'],
      default: 'free'
    },
    startDate: { type: Date, default: Date.now },
    endDate: Date,
    autoRenew: { type: Boolean, default: false },
    billingCycle: {
      type: String,
      enum: ['monthly', 'quarterly', 'yearly'],
      default: 'monthly'
    },
    price: { type: Number, default: 0 }
  },
  // Admin management
  adminNotes: String,
  assignedAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// Set role to viewer
viewerSchema.add({
  role: {
    type: String,
    default: 'viewer',
    enum: ['viewer']
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
});

// Generate viewer ID on creation
viewerSchema.pre('save', function(next) {
  if (this.isNew && !this.viewerId) {
    this.viewerId = 'VWR-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  next();
});

// Pre-save middleware to set default permissions based on access level
viewerSchema.pre('save', function(next) {
  if (this.isNew && (!this.permissions || this.permissions.length === 0)) {
    const defaultPermissions = this.getDefaultPermissionsByAccessLevel();
    this.permissions = defaultPermissions;
  }
  next();
});

// Method to get default permissions by access level
viewerSchema.methods.getDefaultPermissionsByAccessLevel = function() {
  const basePermissions = [
    { resource: 'products', actions: ['read'] },
    { resource: 'categories', actions: ['read'] }
  ];

  switch (this.accessLevel) {
    case 'basic':
      return [
        ...basePermissions,
        { resource: 'analytics', actions: ['read'] }
      ];
    case 'standard':
      return [
        ...basePermissions,
        { resource: 'analytics', actions: ['read', 'export'] },
        { resource: 'reports', actions: ['read'] },
        { resource: 'knowledge_base', actions: ['read'] }
      ];
    case 'premium':
      return [
        ...basePermissions,
        { resource: 'analytics', actions: ['read', 'export'] },
        { resource: 'reports', actions: ['read', 'export', 'download'] },
        { resource: 'knowledge_base', actions: ['read'] },
        { resource: 'orders', actions: ['read'] }
      ];
    case 'enterprise':
      return [
        ...basePermissions,
        { resource: 'analytics', actions: ['read', 'export'] },
        { resource: 'reports', actions: ['read', 'export', 'download'] },
        { resource: 'knowledge_base', actions: ['read'] },
        { resource: 'orders', actions: ['read'] },
        { resource: 'customers', actions: ['read'] }
      ];
    default:
      return basePermissions;
  }
};

// Method to log access
viewerSchema.methods.logAccess = function(action, resource, success = true, details = '') {
  this.accessLog.push({
    action,
    resource,
    success,
    details,
    timestamp: new Date()
  });

  // Keep only last 1000 log entries
  if (this.accessLog.length > 1000) {
    this.accessLog = this.accessLog.slice(-1000);
  }

  return this.save();
};

// Method to add favorite item
viewerSchema.methods.addFavorite = function(itemType, itemId) {
  const existingFavorite = this.metrics.favoriteItems.find(fav => 
    fav.type === itemType && fav.itemId.toString() === itemId.toString()
  );

  if (!existingFavorite) {
    this.metrics.favoriteItems.push({
      type: itemType,
      itemId: itemId
    });
  }

  return this.save();
};

// Method to remove favorite item
viewerSchema.methods.removeFavorite = function(itemType, itemId) {
  this.metrics.favoriteItems = this.metrics.favoriteItems.filter(fav => 
    !(fav.type === itemType && fav.itemId.toString() === itemId.toString())
  );

  return this.save();
};

// Method to add search to history
viewerSchema.methods.addSearchHistory = function(query, resultsCount) {
  this.metrics.searchHistory.push({
    query,
    resultsCount
  });

  // Keep only last 100 search entries
  if (this.metrics.searchHistory.length > 100) {
    this.metrics.searchHistory = this.metrics.searchHistory.slice(-100);
  }

  return this.save();
};

// Method to check if viewer can access resource
viewerSchema.methods.canAccessResource = function(resource, action = 'read') {
  if (this.viewerStatus !== 'active') return false;

  const permission = this.permissions.find(p => p.resource === resource);
  if (!permission) return false;

  return permission.actions.includes(action);
};

// Method to check if viewer can export data
viewerSchema.methods.canExportData = function() {
  return this.viewerSettings.canExportData && 
         this.accessLevel !== 'basic' && 
         this.viewerStatus === 'active';
};

// Method to check if viewer can download reports
viewerSchema.methods.canDownloadReports = function() {
  return this.viewerSettings.canDownloadReports && 
         this.accessLevel !== 'basic' && 
         this.viewerStatus === 'active';
};

// Method to update subscription
viewerSchema.methods.updateSubscription = function(plan, price, billingCycle) {
  this.subscription.plan = plan;
  this.subscription.price = price;
  this.subscription.billingCycle = billingCycle;
  this.subscription.startDate = new Date();
  
  // Set end date based on billing cycle
  const endDate = new Date();
  switch (billingCycle) {
    case 'monthly':
      endDate.setMonth(endDate.getMonth() + 1);
      break;
    case 'quarterly':
      endDate.setMonth(endDate.getMonth() + 3);
      break;
    case 'yearly':
      endDate.setFullYear(endDate.getFullYear() + 1);
      break;
  }
  
  this.subscription.endDate = endDate;
  
  return this.save();
};

// Method to check if subscription is active
viewerSchema.methods.isSubscriptionActive = function() {
  if (this.subscription.plan === 'free') return true;
  
  return this.subscription.endDate && 
         this.subscription.endDate > new Date() && 
         this.viewerStatus === 'active';
};

// Method to get remaining days in subscription
viewerSchema.methods.getSubscriptionDaysRemaining = function() {
  if (this.subscription.plan === 'free') return Infinity;
  
  if (!this.subscription.endDate) return 0;
  
  const now = new Date();
  const end = new Date(this.subscription.endDate);
  const diffTime = end - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
};

module.exports = mongoose.model('Viewer', viewerSchema);
