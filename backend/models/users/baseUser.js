const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const sanitize = require('mongoose-sanitize');

// Base user schema with common fields
const baseUserSchema = new mongoose.Schema({
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
    }
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
  }
}, {
  timestamps: true
});

// Apply sanitization
baseUserSchema.plugin(sanitize);

// Virtual for full name
baseUserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`.trim();
});

// Virtual for display name
baseUserSchema.virtual('displayName').get(function() {
  return this.username || this.fullName || this.email;
});

// Pre-save middleware for password hashing
baseUserSchema.pre('save', async function(next) {
  // Only hash if password is modified AND it's not already a bcrypt hash
  if (!this.isModified('password')) return next();
  
  // Check if password is already hashed (starts with $2b$ or $2a$)
  if (this.password && (this.password.startsWith('$2b$') || this.password.startsWith('$2a$'))) {
    console.log('⚠️ Password already hashed, skipping re-hash');
    return next();
  }
  
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
baseUserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to check if account is locked
baseUserSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Method to increment login attempts
baseUserSchema.methods.incLoginAttempts = function() {
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

module.exports = baseUserSchema;

