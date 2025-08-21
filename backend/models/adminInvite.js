const mongoose = require('mongoose');

const adminInviteSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'support', 'viewer'],
    default: 'admin'
  },
  permissions: [{
    resource: {
      type: String,
      enum: ['products', 'categories', 'orders', 'users', 'analytics', 'settings', 'admin_management']
    },
    actions: [{
      type: String,
      enum: ['read', 'create', 'update', 'delete', 'manage']
    }]
  }],
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'expired', 'cancelled'],
    default: 'pending'
  },
  expiresAt: {
    type: Date,
    required: true
  },
  acceptedAt: {
    type: Date,
    default: null
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for email and token lookups
adminInviteSchema.index({ email: 1 });
adminInviteSchema.index({ token: 1 });
adminInviteSchema.index({ expiresAt: 1 });

// Check if invite is expired
adminInviteSchema.methods.isExpired = function() {
  return Date.now() > this.expiresAt;
};

// Mark invite as accepted
adminInviteSchema.methods.markAccepted = function() {
  this.status = 'accepted';
  this.acceptedAt = new Date();
  return this.save();
};

// Mark invite as expired
adminInviteSchema.methods.markExpired = function() {
  this.status = 'expired';
  return this.save();
};

// Generate invitation token
adminInviteSchema.methods.generateToken = function() {
  const crypto = require('crypto');
  this.token = crypto.randomBytes(32).toString('hex');
  return this.token;
};

// Pre-save middleware to generate token if not exists
adminInviteSchema.pre('save', function(next) {
  if (!this.token) {
    this.generateToken();
  }
  next();
});

// Pre-save middleware to check expiration
adminInviteSchema.pre('save', function(next) {
  if (this.isExpired() && this.status === 'pending') {
    this.status = 'expired';
  }
  next();
});

module.exports = mongoose.model('AdminInvite', adminInviteSchema);

