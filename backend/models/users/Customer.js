const mongoose = require('mongoose');
const baseUserSchema = require('./baseUser');

// Customer-specific schema - extend baseUserSchema
const customerSchema = new mongoose.Schema({
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
  
  // Customer-specific fields
  customerId: {
    type: String,
    unique: true,
    sparse: true
  },
  // Shopping preferences
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
    favoriteCategories: [{
      type: String,
      ref: 'Category'
    }],
    favoriteBrands: [String],
    preferredPaymentMethod: {
      type: String,
      enum: ['credit_card', 'paypal', 'apple_pay', 'google_pay', 'bank_transfer'],
      default: 'credit_card'
    },
    marketingPreferences: {
      emailMarketing: { type: Boolean, default: true },
      smsMarketing: { type: Boolean, default: false },
      pushMarketing: { type: Boolean, default: true }
    }
  },
  // Addresses
  addresses: [{
    type: {
      type: String,
      enum: ['billing', 'shipping', 'both'],
      default: 'both'
    },
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
  // Customer metrics
  metrics: {
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 },
    lastOrderDate: Date,
    customerSince: { type: Date, default: Date.now },
    loyaltyPoints: { type: Number, default: 0 },
    tier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
      default: 'bronze'
    }
  },
  // Social and referral
  referralCode: {
    type: String,
    unique: true,
    sparse: true
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    default: null
  },
  referrals: [{
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer'
    },
    referredAt: { type: Date, default: Date.now },
    rewardEarned: { type: Boolean, default: false }
  }],
  // Customer support
  supportTickets: [{
    ticketId: String,
    subject: String,
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    createdAt: { type: Date, default: Date.now },
    resolvedAt: Date,
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Support'
    }
  }]
}, {
  timestamps: true
});

// Set role to customer
customerSchema.add({
  role: {
    type: String,
    default: 'customer',
    enum: ['customer']
  }
});

// Add baseUserSchema methods and middleware
const bcrypt = require('bcryptjs');
const sanitize = require('mongoose-sanitize');

// Apply sanitization
customerSchema.plugin(sanitize);

// Virtual for full name
customerSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`.trim();
});

// Virtual for display name
customerSchema.virtual('displayName').get(function() {
  return this.username || this.fullName || this.email;
});

// Pre-save middleware for password hashing
customerSchema.pre('save', async function(next) {
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
customerSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to check if account is locked
customerSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Method to increment login attempts
customerSchema.methods.incLoginAttempts = function() {
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

// Generate customer ID on creation
customerSchema.pre('save', function(next) {
  if (this.isNew && !this.customerId) {
    this.customerId = 'CUST-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  next();
});

// Generate referral code on creation
customerSchema.pre('save', function(next) {
  if (this.isNew && !this.referralCode) {
    this.referralCode = 'REF-' + Math.random().toString(36).substr(2, 8).toUpperCase();
  }
  next();
});

// Method to calculate customer tier
customerSchema.methods.calculateTier = function() {
  const totalSpent = this.metrics.totalSpent;
  
  if (totalSpent >= 10000) return 'diamond';
  if (totalSpent >= 5000) return 'platinum';
  if (totalSpent >= 2000) return 'gold';
  if (totalSpent >= 500) return 'silver';
  return 'bronze';
};

// Method to update customer metrics
customerSchema.methods.updateMetrics = function(orderAmount) {
  this.metrics.totalOrders += 1;
  this.metrics.totalSpent += orderAmount;
  this.metrics.averageOrderValue = this.metrics.totalSpent / this.metrics.totalOrders;
  this.metrics.lastOrderDate = new Date();
  this.metrics.tier = this.calculateTier();
  
  // Award loyalty points (1 point per dollar spent)
  this.metrics.loyaltyPoints += Math.floor(orderAmount);
  
  return this.save();
};

// Method to add address
customerSchema.methods.addAddress = function(addressData) {
  // If this is the first address, make it default
  if (this.addresses.length === 0) {
    addressData.isDefault = true;
  }
  
  this.addresses.push(addressData);
  return this.save();
};

// Method to set default address
customerSchema.methods.setDefaultAddress = function(addressIndex) {
  // Remove default from all addresses
  this.addresses.forEach(addr => addr.isDefault = false);
  
  // Set the specified address as default
  if (this.addresses[addressIndex]) {
    this.addresses[addressIndex].isDefault = true;
  }
  
  return this.save();
};

module.exports = mongoose.model('Customer', customerSchema);
