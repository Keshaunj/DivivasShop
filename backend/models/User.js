const mongoose = require('mongoose');
const baseUserSchema = require('./users/baseUser');

// Sub-schema: customer-specific data (used when role === 'customer')
const customerProfileSchema = new mongoose.Schema({
  customerId: { type: String, unique: true, sparse: true },
  addresses: [{
    type: { type: String, enum: ['billing', 'shipping', 'both'], default: 'both' },
    isDefault: { type: Boolean, default: false },
    firstName: String,
    lastName: String,
    company: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    phone: String
  }],
  metrics: {
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 },
    lastOrderDate: Date,
    customerSince: { type: Date, default: Date.now },
    loyaltyPoints: { type: Number, default: 0 },
    tier: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'], default: 'bronze' }
  },
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  referrals: [{
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    referredAt: { type: Date, default: Date.now },
    rewardEarned: { type: Boolean, default: false }
  }]
}, { _id: false });

// Sub-schema: business owner data (used when role === 'business_owner')
const businessOwnerProfileSchema = new mongoose.Schema({
  businessInfo: {
    businessName: { type: String, trim: true },
    businessType: { type: String, enum: ['retail', 'wholesale', 'manufacturing', 'service', 'food_beverage', 'health_beauty', 'fashion', 'home_garden', 'electronics', 'other'], default: 'retail' },
    businessDescription: String,
    industry: String,
    foundedYear: Number,
    employeeCount: { type: String, enum: ['1-10', '11-50', '51-200', '201-500', '500+'], default: '1-10' },
    website: String,
    phone: String,
    taxId: String,
    businessLicense: String
  },
  businessAddress: {
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  businessMetrics: {
    totalRevenue: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 },
    customerCount: { type: Number, default: 0 },
    productCount: { type: Number, default: 0 },
    lastOrderDate: Date,
    businessSince: { type: Date, default: Date.now }
  },
  businessSettings: {
    currency: { type: String, default: 'USD', enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY'] },
    timezone: { type: String, default: 'UTC' },
    autoAcceptOrders: { type: Boolean, default: true },
    requireApproval: { type: Boolean, default: false },
    minimumOrderAmount: { type: Number, default: 0 }
  },
  paymentInfo: {
    preferredPaymentMethod: { type: String, enum: ['bank_transfer', 'paypal', 'stripe', 'check'], default: 'bank_transfer' },
    paypalEmail: String,
    stripeAccountId: String,
    taxRate: { type: Number, default: 0 },
    paymentTerms: { type: String, enum: ['net_15', 'net_30', 'net_60', 'immediate'], default: 'net_30' }
  },
  verification: {
    isVerified: { type: Boolean, default: false },
    verificationDate: Date,
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
  },
  businessStatus: { type: String, enum: ['active', 'suspended', 'pending_verification', 'inactive'], default: 'pending_verification' },
  permissions: [{
    resource: { type: String, enum: ['products', 'categories', 'orders', 'customers', 'analytics', 'settings', 'inventory', 'marketing'] },
    actions: [{ type: String, enum: ['read', 'create', 'update', 'delete', 'manage'] }]
  }],
  adminNotes: String,
  assignedAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { _id: false });

// Sub-schema: admin/staff data (used when role === 'admin' or isAdmin)
const adminProfileSchema = new mongoose.Schema({
  adminId: { type: String, unique: true, sparse: true },
  adminLevel: { type: String, enum: ['super_admin', 'admin', 'moderator', 'support_admin'], default: 'admin' },
  superadmin: { type: Boolean, default: false },
  permissions: [{
    resource: { type: String, enum: ['products', 'categories', 'orders', 'users', 'analytics', 'settings', 'admin_management', 'business_management', 'system_config', 'reports', 'security', 'billing'] },
    actions: [{ type: String, enum: ['read', 'create', 'update', 'delete', 'manage', 'approve', 'suspend', 'restore', 'configure', 'audit'] }]
  }],
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
  adminStatus: { type: String, enum: ['active', 'inactive', 'suspended', 'on_leave', 'training'], default: 'active' },
  adminNotes: String,
  reportsTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { _id: false });

// Single User schema: base + role + optional sub-schemas
const userSchema = new mongoose.Schema({
  ...baseUserSchema.obj,
  role: {
    type: String,
    enum: ['customer', 'business_owner', 'admin', 'manager', 'support', 'viewer'],
    default: 'customer'
  },
  isAdmin: { type: Boolean, default: false },
  adminNotes: { type: String, default: '' },
  // Cart (used mainly for customers)
  cart: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, default: 1 },
    price: { type: Number, default: 0 }
  }],
  // Role-specific sub-documents (only one populated per user)
  customerProfile: { type: customerProfileSchema, default: null },
  businessOwnerProfile: { type: businessOwnerProfileSchema, default: null },
  adminProfile: { type: adminProfileSchema, default: null }
}, {
  timestamps: true,
  collection: 'users'
});

// Re-attach base methods and plugins
userSchema.plugin(require('mongoose-sanitize'));
userSchema.virtual('fullName').get(function() {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim();
});
userSchema.virtual('displayName').get(function() {
  return this.username || this.fullName || this.email;
});

const bcrypt = require('bcryptjs');
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  if (this.password && (this.password.startsWith('$2b$') || this.password.startsWith('$2a$'))) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordChangedAt = Date.now() - 1000;
    next();
  } catch (e) { next(e); }
});
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};
userSchema.methods.incLoginAttempts = function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({ $unset: { lockUntil: 1 }, $set: { loginAttempts: 1 } });
  }
  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }
  return this.updateOne(updates);
};

// Generate customerId / adminId on first save for relevant roles
userSchema.pre('save', function(next) {
  if (!this.isNew) return next();
  if (this.role === 'customer') {
    if (!this.customerProfile) this.customerProfile = {};
    if (!this.customerProfile.customerId) {
      this.customerProfile.customerId = 'CUST-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
  }
  if (this.role === 'admin' || this.isAdmin === true) {
    if (!this.adminProfile) this.adminProfile = {};
    if (!this.adminProfile.adminId) {
      this.adminProfile.adminId = 'ADM-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
  }
  next();
});

// Flatten admin fields to top level for compatibility (adminProfile.adminLevel -> adminLevel on toJSON)
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  if (obj.adminProfile) {
    obj.adminLevel = obj.adminProfile.adminLevel;
    obj.permissions = obj.adminProfile.permissions || obj.permissions;
  }
  if (obj.businessOwnerProfile) {
    obj.businessInfo = obj.businessOwnerProfile.businessInfo;
    obj.businessStatus = obj.businessOwnerProfile.businessStatus;
  }
  if (obj.customerProfile) {
    obj.addresses = obj.customerProfile.addresses;
    obj.metrics = obj.customerProfile.metrics;
  }
  return obj;
};

module.exports = mongoose.model('User', userSchema);
