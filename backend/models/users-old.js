const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 
const sanitize = require('mongoose-sanitize');

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: false, // Make username optional
    trim: true,
    default: '' // Allow empty string
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
  role: {
    type: String,
    enum: ['user', 'admin', 'manager', 'support', 'viewer'],
    default: 'user'
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  // Permission-based access control
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
  // Admin management fields
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  invitedAt: {
    type: Date,
    default: null
  },
  lastAdminAction: {
    type: Date,
    default: null
  },
  adminNotes: {
    type: String,
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
    read: {
      type: Boolean,
      default: false
    }
  }],
  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String
  },
  // Business information for business owners and admins
  businessInfo: {
    businessName: {
      type: String,
      trim: true,
      default: ''
    },
    businessType: {
      type: String,
      trim: true,
      default: ''
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    website: {
      type: String,
      trim: true,
      default: ''
    },
    businessAddress: {
      street: {
        type: String,
        trim: true,
        default: ''
      },
      city: {
        type: String,
        trim: true,
        default: ''
      },
      state: {
        type: String,
        trim: true,
        default: ''
      },
      zip: {
        type: String,
        trim: true,
        default: ''
      },
      country: {
        type: String,
        trim: true,
        default: ''
      }
    }
  }
}, {
  timestamps: true
});


userSchema.pre('save', async function(next) {
  // Security: Don't log password details in production
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(12); 
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    console.error('Error in pre-save hook:', err);
    next(err);
  }
});


userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};


userSchema.plugin(sanitize);

module.exports = mongoose.model('User', userSchema);