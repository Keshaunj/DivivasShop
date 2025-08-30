const mongoose = require('mongoose');
const baseUserSchema = require('./baseUser');

// Business Owner-specific schema
const businessOwnerSchema = new mongoose.Schema({
  // Business information
  businessInfo: {
    businessName: {
      type: String,
      required: true,
      trim: true
    },
    businessType: {
      type: String,
      required: true,
      enum: ['retail', 'wholesale', 'manufacturing', 'service', 'food_beverage', 'health_beauty', 'fashion', 'home_garden', 'electronics', 'other'],
      default: 'retail'
    },
    businessDescription: String,
    industry: String,
    foundedYear: Number,
    employeeCount: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '500+'],
      default: '1-10'
    },
    website: String,
    phone: String,
    taxId: String,
    businessLicense: String
  },
  // Business address
  businessAddress: {
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  // Business metrics
  businessMetrics: {
    totalRevenue: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 },
    customerCount: { type: Number, default: 0 },
    productCount: { type: Number, default: 0 },
    lastOrderDate: Date,
    businessSince: { type: Date, default: Date.now }
  },
  // Business settings
  businessSettings: {
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY']
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    businessHours: {
      monday: { open: String, close: String, closed: { type: Boolean, default: false } },
      tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
      wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
      thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
      friday: { open: String, close: String, closed: { type: Boolean, default: false } },
      saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
      sunday: { open: String, close: String, closed: { type: Boolean, default: true } }
    },
    autoAcceptOrders: { type: Boolean, default: true },
    requireApproval: { type: Boolean, default: false },
    allowBackorders: { type: Boolean, default: false },
    minimumOrderAmount: { type: Number, default: 0 }
  },
  // Payment and billing
  paymentInfo: {
    preferredPaymentMethod: {
      type: String,
      enum: ['bank_transfer', 'paypal', 'stripe', 'check'],
      default: 'bank_transfer'
    },
    bankAccount: {
      accountNumber: String,
      routingNumber: String,
      accountType: String,
      bankName: String
    },
    paypalEmail: String,
    stripeAccountId: String,
    taxRate: { type: Number, default: 0 },
    paymentTerms: {
      type: String,
      enum: ['net_15', 'net_30', 'net_60', 'immediate'],
      default: 'net_30'
    }
  },
  // Business verification
  verification: {
    isVerified: { type: Boolean, default: false },
    verificationDate: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    documents: [{
      type: {
        type: String,
        enum: ['business_license', 'tax_certificate', 'insurance_certificate', 'other']
      },
      filename: String,
      uploadedAt: { type: Date, default: Date.now },
      verified: { type: Boolean, default: false }
    }]
  },
  // Business categories and tags
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  tags: [String],
  // Business owner permissions
  permissions: [{
    resource: {
      type: String,
      enum: ['products', 'categories', 'orders', 'customers', 'analytics', 'settings', 'inventory', 'marketing']
    },
    actions: [{
      type: String,
      enum: ['read', 'create', 'update', 'delete', 'manage']
    }]
  }],
  // Business status
  businessStatus: {
    type: String,
    enum: ['active', 'suspended', 'pending_verification', 'inactive'],
    default: 'pending_verification'
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

// Set role to business_owner
businessOwnerSchema.add({
  role: {
    type: String,
    default: 'business_owner',
    enum: ['business_owner']
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
});

// Pre-save middleware to set default permissions
businessOwnerSchema.pre('save', function(next) {
  if (this.isNew && (!this.permissions || this.permissions.length === 0)) {
    this.permissions = [
      { resource: 'products', actions: ['read', 'create', 'update', 'delete'] },
      { resource: 'categories', actions: ['read', 'create', 'update'] },
      { resource: 'orders', actions: ['read', 'update'] },
      { resource: 'customers', actions: ['read'] },
      { resource: 'analytics', actions: ['read'] },
      { resource: 'settings', actions: ['read', 'update'] },
      { resource: 'inventory', actions: ['read', 'update'] },
      { resource: 'marketing', actions: ['read', 'create'] }
    ];
  }
  next();
});

// Method to update business metrics
businessOwnerSchema.methods.updateMetrics = function(orderData) {
  this.businessMetrics.totalOrders += 1;
  this.businessMetrics.totalRevenue += orderData.totalAmount;
  this.businessMetrics.averageOrderValue = this.businessMetrics.totalRevenue / this.businessMetrics.totalOrders;
  this.businessMetrics.lastOrderDate = new Date();
  
  return this.save();
};

// Method to add business document
businessOwnerSchema.methods.addDocument = function(documentData) {
  this.verification.documents.push(documentData);
  return this.save();
};

// Method to verify business
businessOwnerSchema.methods.verifyBusiness = function(adminId) {
  this.verification.isVerified = true;
  this.verification.verificationDate = new Date();
  this.verification.verifiedBy = adminId;
  this.businessStatus = 'active';
  
  return this.save();
};

// Method to suspend business
businessOwnerSchema.methods.suspendBusiness = function(reason) {
  this.businessStatus = 'suspended';
  this.adminNotes = reason;
  
  return this.save();
};

// Method to check if business can accept orders
businessOwnerSchema.methods.canAcceptOrders = function() {
  return this.businessStatus === 'active' && this.isActive;
};

// Method to get business hours for a specific day
businessOwnerSchema.methods.getBusinessHours = function(day) {
  const dayKey = day.toLowerCase();
  return this.businessSettings.businessHours[dayKey] || { closed: true };
};

// Method to check if business is open
businessOwnerSchema.methods.isOpen = function() {
  const now = new Date();
  const day = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const time = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
  
  const hours = this.getBusinessHours(day);
  if (hours.closed) return false;
  
  return time >= hours.open && time <= hours.close;
};

module.exports = mongoose.model('BusinessOwner', businessOwnerSchema);

