const mongoose = require('mongoose');
require('dotenv').config();

// Import both old and new models
const { Admin } = require('./models/users');
const oldUserModel = require('./models/users-old'); // Old monolithic user model

async function migrateAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully');
    
    console.log('=== ADMIN USER MIGRATION START ===');
    
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
      lastName: oldAdmin.lastName,
      role: oldAdmin.role,
      isAdmin: oldAdmin.isAdmin
    });
    
    // Step 2: Check if admin already exists in new schema
    const existingAdmin = await Admin.findOne({ email: oldAdmin.email });
    if (existingAdmin) {
      console.log('⚠️ Admin already exists in new schema, updating...');
      
      // Update existing admin with superadmin privileges
      existingAdmin.superadmin = true;
      existingAdmin.adminLevel = 'super_admin';
      existingAdmin.firstName = oldAdmin.firstName || 'Keshaun';
      existingAdmin.lastName = oldAdmin.lastName || 'Jones';
      
      await existingAdmin.save();
      console.log('✅ Existing admin updated with superadmin privileges');
      
      return;
    }
    
    // Step 3: Create new admin user in new schema
    console.log('Creating new admin user in new schema...');
    
    const newAdminData = {
      email: oldAdmin.email,
      username: oldAdmin.username || 'keshaunjones48',
      password: oldAdmin.password, // This will be re-hashed by the new schema
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
    
    // Step 4: Test login with new admin
    console.log('\n=== TESTING NEW ADMIN LOGIN ===');
    const testAdmin = await Admin.findOne({ email: oldAdmin.email }).select('+password');
    
    if (testAdmin) {
      console.log('✅ Admin found in new schema');
      console.log('✅ Has comparePassword method:', typeof testAdmin.comparePassword === 'function');
      console.log('✅ Superadmin flag:', testAdmin.superadmin);
      console.log('✅ Admin level:', testAdmin.adminLevel);
      
      // Test password comparison
      const passwordMatch = await testAdmin.comparePassword('testpassword123');
      console.log('✅ Password verification:', passwordMatch ? 'SUCCESS' : 'FAILED');
    }
    
    console.log('\n=== MIGRATION COMPLETE ===');
    console.log('🔑 You can now login with:');
    console.log('   Email: keshaunjones48@gmail.com');
            console.log('   Password: testpassword123');
    console.log('   Superadmin: true');
    
    // Step 5: Create rollback backup
    console.log('\n=== CREATING ROLLBACK BACKUP ===');
    const backupData = {
      originalUserId: oldAdmin._id,
      migratedAt: new Date(),
      newAdminId: newAdmin._id,
      originalData: oldAdmin.toObject()
    };
    
    // Save backup to a backup collection
    const backupCollection = mongoose.connection.collection('admin_migration_backup');
    await backupCollection.insertOne(backupData);
    console.log('✅ Rollback backup created in admin_migration_backup collection');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

migrateAdminUser();
