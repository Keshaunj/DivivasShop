const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const sanitize = require('mongoose-sanitize');

const businessOwnerSchema = new mongoose.Schema({
  // Business Owner Personal Information
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  nickname: {
    type: String,
    trim: true,
    default: null
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },

  // Business Information
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  businessLLC: {
    type: String,
    required: true,
    trim: true
  },
  businessType: {
    type: String,
    enum: ['LLC', 'Corporation', 'Sole Proprietorship', 'Partnership', 'Other'],
    default: 'LLC'
  },
  businessIndustry: {
    type: String,
    required: true,
    trim: true
  },
  businessDescription: {
    type: String,
    trim: true
  },

  // Business Address
  businessAddress: {
    street: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    zipCode: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      required: true,
      trim: true,
      default: 'USA'
    }
  },

  // Account & Authentication
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },

  // Subscription & Billing
  subscriptionPlan: {
    type: String,
    enum: ['basic', 'premium', 'enterprise', 'custom'],
    default: 'basic'
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'cancelled', 'pending'],
    default: 'pending'
  },
  subscriptionStartDate: {
    type: Date,
    default: null
  },
  subscriptionEndDate: {
    type: Date,
    default: null
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly', 'quarterly'],
    default: 'monthly'
  },
  monthlyFee: {
    type: Number,
    default: 29.99
  },
  lastPaymentDate: {
    type: Date,
    default: null
  },
  nextPaymentDate: {
    type: Date,
    default: null
  },

  // Payment Information
  paymentMethod: {
    cardLast4: String,
    cardBrand: String,
    expiryMonth: String,
    expiryYear: String
  },

  // Business Owner Access Control
  accessLevel: {
    type: String,
    enum: ['owner', 'admin', 'manager'],
    default: 'owner'
  },
  isSuperAdmin: {
    type: Boolean,
    default: false
  },

  // Store Configuration
  storefrontUrl: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  storefrontTheme: {
    type: String,
    default: 'default'
  },
  storefrontSettings: {
    logo: String,
    primaryColor: {
      type: String,
      default: '#3B82F6'
    },
    secondaryColor: {
      type: String,
      default: '#1F2937'
    },
    customCSS: String,
    customJS: String
  },

  // Business Metrics & Limits
  productLimit: {
    type: Number,
    default: 100
  },
  orderLimit: {
    type: Number,
    default: 1000
  },
  storageLimit: {
    type: Number, // in MB
    default: 1024
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
    read: {
      type: Boolean,
      default: false
    }
  }],

  // Business Owner Preferences
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    smsNotifications: {
      type: Boolean,
      default: false
    },
    marketingEmails: {
      type: Boolean,
      default: true
    },
    timezone: {
      type: String,
      default: 'America/New_York'
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },

  // Support & Communication
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
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Business Owner Notes (for admin use)
  adminNotes: {
    type: String,
    trim: true
  },

  // Status Tracking
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending_verification'],
    default: 'pending_verification'
  },
  suspensionReason: {
    type: String,
    trim: true
  },
  suspensionDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Virtual for full name
businessOwnerSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for business owner since
businessOwnerSchema.virtual('businessOwnerSince').get(function() {
  return this.createdAt;
});

// Virtual for subscription status
businessOwnerSchema.virtual('isSubscriptionActive').get(function() {
  if (this.subscriptionStatus !== 'active') return false;
  if (!this.subscriptionEndDate) return true;
  return new Date() < this.subscriptionEndDate;
});

// Virtual for days until payment
businessOwnerSchema.virtual('daysUntilPayment').get(function() {
  if (!this.nextPaymentDate) return null;
  const now = new Date();
  const paymentDate = new Date(this.nextPaymentDate);
  const diffTime = paymentDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Pre-save middleware to hash password
businessOwnerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
businessOwnerSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get business owner summary
businessOwnerSchema.methods.getSummary = function() {
  return {
    id: this._id,
    fullName: this.fullName,
    email: this.email,
    businessName: this.businessName,
    businessLLC: this.businessLLC,
    subscriptionStatus: this.subscriptionStatus,
    subscriptionPlan: this.subscriptionPlan,
    isActive: this.isActive,
    status: this.status,
    createdAt: this.createdAt,
    businessOwnerSince: this.businessOwnerSince
  };
};

// Method to check if business owner can add more products
businessOwnerSchema.methods.canAddProduct = function(currentProductCount) {
  return currentProductCount < this.productLimit;
};

// Method to check if business owner can process more orders
businessOwnerSchema.methods.canProcessOrder = function(currentOrderCount) {
  return currentOrderCount < this.orderLimit;
};

// Static method to find active business owners
businessOwnerSchema.statics.findActive = function() {
  return this.find({ 
    isActive: true, 
    status: 'active',
    subscriptionStatus: 'active'
  });
};

// Static method to find business owners with overdue payments
businessOwnerSchema.statics.findOverdue = function() {
  const now = new Date();
  return this.find({
    subscriptionStatus: 'active',
    nextPaymentDate: { $lt: now }
  });
};

// Apply sanitize plugin
businessOwnerSchema.plugin(sanitize);

module.exports = mongoose.model('BusinessOwner', businessOwnerSchema); 