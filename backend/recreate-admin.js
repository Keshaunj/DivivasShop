const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const { Admin } = require('./models/users');
const oldUserModel = require('./models/users-old');

async function recreateAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully');
    
    console.log('=== RECREATING ADMIN USER ===');
    
    // Step 1: Find the old admin user
    const oldAdmin = await oldUserModel.findOne({ 
      email: 'keshaunjones48@gmail.com',
      isAdmin: true 
    });
    
    if (!oldAdmin) {
      console.log('❌ Old admin user not found');
      return;
    }
    
    console.log('✅ Old admin user found:', {
      id: oldAdmin._id,
      email: oldAdmin.email,
      username: oldAdmin.username,
      firstName: oldAdmin.firstName,
      lastName: oldAdmin.lastName
    });
    
    // Step 2: Delete existing admin in new schema
    const existingAdmin = await Admin.findOne({ email: oldAdmin.email });
    if (existingAdmin) {
      console.log('Deleting existing admin in new schema...');
      await existingAdmin.deleteOne();
      console.log('✅ Existing admin deleted');
    }
    
    // Step 3: Create new admin with fixed schema
    console.log('Creating new admin user with fixed schema...');
    
    const newAdminData = {
      email: oldAdmin.email,
      username: oldAdmin.username || 'keshaunjones48',
              password: 'testpassword123', // Will be hashed by pre-save middleware
      firstName: oldAdmin.firstName || 'Keshaun',
      lastName: oldAdmin.lastName || 'Jones',
      role: 'admin',
      isActive: true,
      superadmin: true, // Emergency access flag
      adminLevel: 'super_admin',
      adminId: 'ADM-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
      
      // Admin-specific fields
      permissions: oldAdmin.permissions || [
        { resource: 'products', actions: ['read', 'create', 'update', 'delete'] },
        { resource: 'categories', actions: ['read', 'create', 'update', 'delete'] },
        { resource: 'orders', actions: ['read', 'update'] },
        { resource: 'users', actions: ['read', 'update'] },
        { resource: 'analytics', actions: ['read'] },
        { resource: 'settings', actions: ['read', 'update'] },
        { resource: 'admin_management', actions: ['read', 'create', 'update', 'delete'] }
      ],
      
      adminSettings: {
        canManageUsers: true,
        canManageBusinesses: true,
        canManageAdmins: true,
        canViewSystemLogs: true,
        canModifySystemConfig: true,
        canAccessFinancialData: true,
        canManageSecurity: true,
        canPerformAudits: true,
        canManageBilling: true,
        canViewAnalytics: true
      },
      
      accessControl: {
        ipWhitelist: [],
        allowedDevices: [],
        sessionTimeout: 3600,
        requireTwoFactor: false,
        lastPasswordChange: new Date(),
        passwordExpiryDays: 90
      },
      
      metrics: {
        usersManaged: 0,
        businessesManaged: 0,
        actionsPerformed: 0,
        lastActionDate: new Date(),
        performanceRating: 5,
        lastReviewDate: new Date()
      },
      
      responsibilities: [
        { type: 'user_management', isActive: true, assignedAt: new Date() },
        { type: 'business_verification', isActive: true, assignedAt: new Date() },
        { type: 'system_maintenance', isActive: true, assignedAt: new Date() },
        { type: 'security_monitoring', isActive: true, assignedAt: new Date() }
      ]
    };
    
    const newAdmin = await Admin.create(newAdminData);
    console.log('✅ New admin user created successfully:', {
      id: newAdmin._id,
      email: newAdmin.email,
      username: newAdmin.username,
      superadmin: newAdmin.superadmin,
      adminLevel: newAdmin.adminLevel,
      adminId: newAdmin.adminId
    });
    
    // Step 4: Test the new admin
    console.log('\n=== TESTING NEW ADMIN ===');
    const testAdmin = await Admin.findOne({ email: oldAdmin.email }).select('+password');
    
    if (testAdmin) {
      console.log('✅ Admin found in new schema');
      console.log('✅ Email:', testAdmin.email);
      console.log('✅ Username:', testAdmin.username);
      console.log('✅ Has comparePassword method:', typeof testAdmin.comparePassword === 'function');
      console.log('✅ Superadmin flag:', testAdmin.superadmin);
      console.log('✅ Admin level:', testAdmin.adminLevel);
      
      // Test password comparison
      const passwordMatch = await testAdmin.comparePassword('testpassword123');
      console.log('✅ Password verification:', passwordMatch ? 'SUCCESS' : 'FAILED');
    }
    
    console.log('\n=== ADMIN RECREATION COMPLETE ===');
    console.log('🔑 You can now login with:');
    console.log('   Email: keshaunjones48@gmail.com');
            console.log('   Password: testpassword123');
    console.log('   Superadmin: true');
    
  } catch (error) {
    console.error('❌ Admin recreation failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

recreateAdmin();
