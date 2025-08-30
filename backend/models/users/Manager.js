const mongoose = require('mongoose');
const baseUserSchema = require('./baseUser');

// Manager-specific schema
const managerSchema = new mongoose.Schema({
  // Manager information
  managerId: {
    type: String,
    unique: true,
    sparse: true
  },
  // Manager role and department
  department: {
    type: String,
    required: true,
    enum: ['sales', 'marketing', 'operations', 'customer_service', 'finance', 'hr', 'it', 'general']
  },
  position: {
    type: String,
    required: true,
    trim: true
  },
  // Manager permissions
  permissions: [{
    resource: {
      type: String,
      enum: ['products', 'categories', 'orders', 'customers', 'analytics', 'settings', 'inventory', 'marketing', 'staff', 'reports']
    },
    actions: [{
      type: String,
      enum: ['read', 'create', 'update', 'delete', 'manage', 'approve']
    }]
  }],
  // Manager metrics
  metrics: {
    teamSize: { type: Number, default: 0 },
    projectsManaged: { type: Number, default: 0 },
    performanceRating: { type: Number, min: 1, max: 5, default: 3 },
    lastReviewDate: Date,
    promotedAt: Date
  },
  // Team management
  teamMembers: [{
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    },
    role: String,
    assignedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
  }],
  // Manager settings
  managerSettings: {
    canApproveOrders: { type: Boolean, default: true },
    canManageStaff: { type: Boolean, default: true },
    canViewFinancials: { type: Boolean, default: false },
    canManageInventory: { type: Boolean, default: true },
    canManageProducts: { type: Boolean, default: true },
    canManageCategories: { type: Boolean, default: true },
    canViewAnalytics: { type: Boolean, default: true },
    canManageSettings: { type: Boolean, default: false }
  },
  // Reporting structure
  reportsTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  },
  directReports: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  }],
  // Manager performance
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
  // Manager access
  accessLevel: {
    type: String,
    enum: ['junior', 'senior', 'lead', 'principal'],
    default: 'junior'
  },
  // Manager status
  managerStatus: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'on_leave'],
    default: 'active'
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

// Set role to manager
managerSchema.add({
  role: {
    type: String,
    default: 'manager',
    enum: ['manager']
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
});

// Generate manager ID on creation
managerSchema.pre('save', function(next) {
  if (this.isNew && !this.managerId) {
    this.managerId = 'MGR-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  next();
});

// Pre-save middleware to set default permissions based on department
managerSchema.pre('save', function(next) {
  if (this.isNew && (!this.permissions || this.permissions.length === 0)) {
    const defaultPermissions = this.getDefaultPermissionsByDepartment();
    this.permissions = defaultPermissions;
  }
  next();
});

// Method to get default permissions by department
managerSchema.methods.getDefaultPermissionsByDepartment = function() {
  const basePermissions = [
    { resource: 'products', actions: ['read', 'update'] },
    { resource: 'orders', actions: ['read', 'update'] },
    { resource: 'customers', actions: ['read'] },
    { resource: 'analytics', actions: ['read'] }
  ];

  switch (this.department) {
    case 'sales':
      return [
        ...basePermissions,
        { resource: 'products', actions: ['read', 'update'] },
        { resource: 'customers', actions: ['read', 'update'] },
        { resource: 'orders', actions: ['read', 'update', 'approve'] },
        { resource: 'reports', actions: ['read'] }
      ];
    case 'marketing':
      return [
        ...basePermissions,
        { resource: 'products', actions: ['read', 'update'] },
        { resource: 'marketing', actions: ['read', 'create', 'update'] },
        { resource: 'analytics', actions: ['read', 'create'] }
      ];
    case 'operations':
      return [
        ...basePermissions,
        { resource: 'inventory', actions: ['read', 'update'] },
        { resource: 'orders', actions: ['read', 'update', 'approve'] },
        { resource: 'staff', actions: ['read', 'update'] }
      ];
    case 'customer_service':
      return [
        ...basePermissions,
        { resource: 'customers', actions: ['read', 'update'] },
        { resource: 'orders', actions: ['read', 'update'] },
        { resource: 'staff', actions: ['read'] }
      ];
    default:
      return basePermissions;
  }
};

// Method to add team member
managerSchema.methods.addTeamMember = function(staffId, role) {
  this.teamMembers.push({
    employee: staffId,
    role: role
  });
  this.metrics.teamSize = this.teamMembers.filter(member => member.isActive).length;
  return this.save();
};

// Method to remove team member
managerSchema.methods.removeTeamMember = function(staffId) {
  const memberIndex = this.teamMembers.findIndex(member => 
    member.employee.toString() === staffId.toString()
  );
  
  if (memberIndex !== -1) {
    this.teamMembers[memberIndex].isActive = false;
    this.metrics.teamSize = this.teamMembers.filter(member => member.isActive).length;
  }
  
  return this.save();
};

// Method to update performance KPI
managerSchema.methods.updateKPI = function(kpiName, actualValue) {
  const kpi = this.performance.kpis.find(k => k.name === kpiName);
  if (kpi) {
    kpi.actual = actualValue;
    kpi.lastUpdated = new Date();
  }
  return this.save();
};

// Method to add goal
managerSchema.methods.addGoal = function(goalData) {
  this.performance.goals.push(goalData);
  return this.save();
};

// Method to update goal progress
managerSchema.methods.updateGoalProgress = function(goalId, progress) {
  const goal = this.performance.goals.id(goalId);
  if (goal) {
    goal.progress = progress;
    if (progress >= 100) {
      goal.status = 'completed';
    }
  }
  return this.save();
};

// Method to check if manager can approve orders
managerSchema.methods.canApproveOrders = function() {
  return this.managerSettings.canApproveOrders && this.managerStatus === 'active';
};

// Method to check if manager can manage staff
managerSchema.methods.canManageStaff = function() {
  return this.managerSettings.canManageStaff && this.managerStatus === 'active';
};

module.exports = mongoose.model('Manager', managerSchema);
