const mongoose = require('mongoose');
const baseUserSchema = require('./baseUser');

// Customer Support-specific schema
const supportSchema = new mongoose.Schema({
  // Support agent information
  supportId: {
    type: String,
    unique: true,
    sparse: true
  },
  // Support role and specialization
  specialization: {
    type: String,
    required: true,
    enum: ['general', 'technical', 'billing', 'orders', 'returns', 'product', 'escalation']
  },
  level: {
    type: String,
    enum: ['tier1', 'tier2', 'tier3', 'senior', 'lead'],
    default: 'tier1'
  },
  // Support permissions
  permissions: [{
    resource: {
      type: String,
      enum: ['customers', 'orders', 'tickets', 'products', 'analytics', 'knowledge_base']
    },
    actions: [{
      type: String,
      enum: ['read', 'create', 'update', 'delete', 'escalate', 'resolve']
    }]
  }],
  // Support metrics
  metrics: {
    ticketsResolved: { type: Number, default: 0 },
    averageResolutionTime: { type: Number, default: 0 }, // in minutes
    customerSatisfaction: { type: Number, min: 0, max: 5, default: 0 },
    responseTime: { type: Number, default: 0 }, // in minutes
    escalationRate: { type: Number, default: 0 }, // percentage
    lastTicketDate: Date
  },
  // Current workload
  currentTickets: [{
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SupportTicket'
    },
    assignedAt: { type: Date, default: Date.now },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'waiting_customer', 'resolved'],
      default: 'open'
    }
  }],
  // Support settings
  supportSettings: {
    maxConcurrentTickets: { type: Number, default: 5 },
    autoAssignTickets: { type: Boolean, default: true },
    canEscalateTickets: { type: Boolean, default: true },
    canResolveTickets: { type: Boolean, default: true },
    canViewCustomerHistory: { type: Boolean, default: true },
    canViewOrderDetails: { type: Boolean, default: true },
    canIssueRefunds: { type: Boolean, default: false },
    canModifyOrders: { type: Boolean, default: false }
  },
  // Working hours and availability
  availability: {
    isAvailable: { type: Boolean, default: true },
    workingHours: {
      monday: { start: String, end: String, available: { type: Boolean, default: true } },
      tuesday: { start: String, end: String, available: { type: Boolean, default: true } },
      wednesday: { start: String, end: String, available: { type: Boolean, default: true } },
      thursday: { start: String, end: String, available: { type: Boolean, default: true } },
      friday: { start: String, end: String, available: { type: Boolean, default: true } },
      saturday: { start: String, end: String, available: { type: Boolean, default: false } },
      sunday: { start: String, end: String, available: { type: Boolean, default: false } }
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    breakTime: {
      start: String,
      end: String
    }
  },
  // Knowledge and skills
  skills: [{
    name: String,
    proficiency: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner'
    },
    certified: { type: Boolean, default: false },
    lastUpdated: { type: Date, default: Date.now }
  }],
  // Support performance
  performance: {
    qualityScore: { type: Number, min: 0, max: 100, default: 0 },
    efficiencyScore: { type: Number, min: 0, max: 100, default: 0 },
    lastReviewDate: Date,
    goals: [{
      title: String,
      target: Number,
      current: Number,
      deadline: Date,
      status: {
        type: String,
        enum: ['active', 'completed', 'overdue'],
        default: 'active'
      }
    }]
  },
  // Support status
  supportStatus: {
    type: String,
    enum: ['active', 'inactive', 'training', 'on_leave', 'suspended'],
    default: 'active'
  },
  // Reporting structure
  reportsTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Manager',
    default: null
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

// Set role to support
supportSchema.add({
  role: {
    type: String,
    default: 'support',
    enum: ['support']
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
});

// Generate support ID on creation
supportSchema.pre('save', function(next) {
  if (this.isNew && !this.supportId) {
    this.supportId = 'SUP-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  next();
});

// Pre-save middleware to set default permissions based on level
supportSchema.pre('save', function(next) {
  if (this.isNew && (!this.permissions || this.permissions.length === 0)) {
    const defaultPermissions = this.getDefaultPermissionsByLevel();
    this.permissions = defaultPermissions;
  }
  next();
});

// Method to get default permissions by level
supportSchema.methods.getDefaultPermissionsByLevel = function() {
  const basePermissions = [
    { resource: 'customers', actions: ['read', 'update'] },
    { resource: 'tickets', actions: ['read', 'create', 'update'] }
  ];

  switch (this.level) {
    case 'tier1':
      return [
        ...basePermissions,
        { resource: 'orders', actions: ['read'] },
        { resource: 'products', actions: ['read'] }
      ];
    case 'tier2':
      return [
        ...basePermissions,
        { resource: 'orders', actions: ['read', 'update'] },
        { resource: 'products', actions: ['read'] },
        { resource: 'knowledge_base', actions: ['read', 'create'] }
      ];
    case 'tier3':
      return [
        ...basePermissions,
        { resource: 'orders', actions: ['read', 'update', 'modify'] },
        { resource: 'products', actions: ['read', 'update'] },
        { resource: 'knowledge_base', actions: ['read', 'create', 'update'] },
        { resource: 'analytics', actions: ['read'] }
      ];
    case 'senior':
      return [
        ...basePermissions,
        { resource: 'orders', actions: ['read', 'update', 'modify'] },
        { resource: 'products', actions: ['read', 'update'] },
        { resource: 'knowledge_base', actions: ['read', 'create', 'update', 'delete'] },
        { resource: 'analytics', actions: ['read', 'create'] },
        { resource: 'tickets', actions: ['read', 'create', 'update', 'delete', 'escalate', 'resolve'] }
      ];
    case 'lead':
      return [
        ...basePermissions,
        { resource: 'orders', actions: ['read', 'update', 'modify'] },
        { resource: 'products', actions: ['read', 'update'] },
        { resource: 'knowledge_base', actions: ['read', 'create', 'update', 'delete'] },
        { resource: 'analytics', actions: ['read', 'create'] },
        { resource: 'tickets', actions: ['read', 'create', 'update', 'delete', 'escalate', 'resolve'] },
        { resource: 'customers', actions: ['read', 'update', 'delete'] }
      ];
    default:
      return basePermissions;
  }
};

// Method to assign ticket
supportSchema.methods.assignTicket = function(ticketId, priority = 'medium') {
  if (this.currentTickets.length >= this.supportSettings.maxConcurrentTickets) {
    throw new Error('Maximum concurrent tickets reached');
  }

  this.currentTickets.push({
    ticket: ticketId,
    priority: priority,
    status: 'open'
  });

  return this.save();
};

// Method to resolve ticket
supportSchema.methods.resolveTicket = function(ticketId, resolutionTime) {
  const ticketIndex = this.currentTickets.findIndex(t => 
    t.ticket.toString() === ticketId.toString()
  );

  if (ticketIndex !== -1) {
    this.currentTickets[ticketIndex].status = 'resolved';
    this.metrics.ticketsResolved += 1;
    
    // Update average resolution time
    if (this.metrics.ticketsResolved > 1) {
      this.metrics.averageResolutionTime = 
        (this.metrics.averageResolutionTime * (this.metrics.ticketsResolved - 1) + resolutionTime) / 
        this.metrics.ticketsResolved;
    } else {
      this.metrics.averageResolutionTime = resolutionTime;
    }
    
    this.metrics.lastTicketDate = new Date();
  }

  return this.save();
};

// Method to escalate ticket
supportSchema.methods.escalateTicket = function(ticketId, reason) {
  if (!this.supportSettings.canEscalateTickets) {
    throw new Error('Agent does not have permission to escalate tickets');
  }

  const ticketIndex = this.currentTickets.findIndex(t => 
    t.ticket.toString() === ticketId.toString()
  );

  if (ticketIndex !== -1) {
    this.currentTickets[ticketIndex].status = 'escalated';
    this.metrics.escalationRate = 
      (this.metrics.ticketsResolved > 0) ? 
      (this.metrics.ticketsResolved / (this.metrics.ticketsResolved + 1)) * 100 : 0;
  }

  return this.save();
};

// Method to update availability
supportSchema.methods.updateAvailability = function(isAvailable) {
  this.availability.isAvailable = isAvailable;
  return this.save();
};

// Method to add skill
supportSchema.methods.addSkill = function(skillName, proficiency = 'beginner') {
  const existingSkill = this.skills.find(skill => skill.name === skillName);
  
  if (existingSkill) {
    existingSkill.proficiency = proficiency;
    existingSkill.lastUpdated = new Date();
  } else {
    this.skills.push({
      name: skillName,
      proficiency: proficiency
    });
  }

  return this.save();
};

// Method to check if agent can handle ticket
supportSchema.methods.canHandleTicket = function(ticketType) {
  return this.supportStatus === 'active' && 
         this.availability.isAvailable && 
         this.skills.some(skill => skill.name === ticketType);
};

// Method to calculate workload
supportSchema.methods.getWorkload = function() {
  const openTickets = this.currentTickets.filter(t => 
    t.status === 'open' || t.status === 'in_progress'
  ).length;
  
  return {
    current: openTickets,
    max: this.supportSettings.maxConcurrentTickets,
    percentage: (openTickets / this.supportSettings.maxConcurrentTickets) * 100
  };
};

module.exports = mongoose.model('Support', supportSchema);
