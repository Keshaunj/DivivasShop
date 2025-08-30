const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');
require('dotenv').config();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to get user input
const question = (query) => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

// Helper function to get hidden password input
const questionHidden = (query) => {
  return new Promise((resolve) => {
    // Use a simple approach that works reliably
    // The password will be visible while typing but not logged anywhere
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/divias-shop', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Import the correct models
const { Customer, BusinessOwner, Manager, Support, Viewer, Admin } = require('./models/users');

const createSuperAdmin = async () => {
  try {
    console.log('🔐 Setting up Admin User...\n');
    
    // Check if super admin already exists
    const existingAdmin = await Admin.findOne({ role: 'admin', isAdmin: true });
    if (existingAdmin) {
      console.log('✅ Super Admin already exists:', existingAdmin.email);
      console.log('🔄 You can still create additional super admins or regular admins.\n');
    }

    // Choose admin type first
    console.log('\n👑 Choose admin type:');
    console.log('1. Super Admin (full platform access + can manage other admins)');
    console.log('2. Regular Admin (business owner access)');
    console.log('3. Manager (limited business access)');
    console.log('4. Support (customer support access)');
    
    const adminType = await question('\nEnter your choice (1-4): ');
    
    // Determine admin type name for display
    let adminTypeName;
    switch(adminType) {
      case '1':
        adminTypeName = 'Super Admin';
        break;
      case '2':
        adminTypeName = 'Regular Admin';
        break;
      case '3':
        adminTypeName = 'Manager';
        break;
      case '4':
        adminTypeName = 'Support';
        break;
      default:
        adminTypeName = 'Admin User';
    }
    
    console.log(`\n🔐 Setting up ${adminTypeName}...`);
    
    // Get user input
    console.log('\n📧 Getting email...');
    const email = await question('\n📧 Enter email for new admin: ');
    console.log('✅ Email received:', email);
    
    console.log('\n🔑 Getting password...');
    const password = await questionHidden('🔑 Enter password for new admin: ');
    console.log('✅ Password received (length:', password.length, ')');
    
    console.log('\n🔑 Getting password confirmation...');
    const confirmPassword = await questionHidden('🔑 Confirm password: ');
    console.log('✅ Password confirmation received (length:', confirmPassword.length, ')');
    
    console.log('\n💡 Note: Password confirmation must match exactly!');
    
    // Validate input
    if (!email || !email.includes('@')) {
      console.log('❌ Please enter a valid email address');
      rl.close();
      return;
    }
    
    if (password !== confirmPassword) {
      console.log('❌ Passwords do not match');
      rl.close();
      return;
    }
    
    if (password.length < 6) {
      console.log('❌ Password must be at least 6 characters long');
      rl.close();
      return;
    }

    console.log('\n⏳ Creating admin user...');
    
    // Create admin user - IMPORTANT: We hash the password manually to avoid double-hashing
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const newAdmin = new Admin({
      username: email.split('@')[0], // Use email prefix as username
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: adminType === '1' ? 'admin' : adminType === '2' ? 'admin' : adminType === '3' ? 'manager' : 'support',
      isAdmin: adminType === '1' || adminType === '2',
      adminLevel: adminType === '1' ? 'super_admin' : 'standard',
      superadmin: adminType === '1',
      permissions: getPermissionsForType(adminType),
      invitedBy: existingAdmin ? existingAdmin._id : null,
      invitedAt: new Date(),
      isActive: true
    });

    // IMPORTANT: Use insertOne to bypass the pre-save middleware and prevent double-hashing
    // This ensures the password is only hashed once
    const adminData = newAdmin.toObject();
    delete adminData._id; // Remove the _id field for insertOne
    
    const result = await Admin.collection.insertOne(adminData);
    console.log('✅ Admin user created with ID:', result.insertedId);
    
    console.log('\n✅ Admin user created successfully!');
    console.log('📧 Email:', email);
    console.log('👑 Role:', adminTypeName);
    console.log('🔑 Password: [Private - not logged]');
    console.log('📋 Permissions:', newAdmin.permissions.length, 'resources');
    console.log('🚀 New admin can now login to the admin panel!');
    
    // Show permission summary
    console.log('\n📋 Permission Summary:');
    newAdmin.permissions.forEach(perm => {
      console.log(`   ${perm.resource}: ${perm.actions.join(', ')}`);
    });
    
    // Ask if they want to create another admin
    const createAnother = await question('\n🤔 Create another admin? (yes/no): ');
    if (createAnother.toLowerCase() === 'yes' || createAnother.toLowerCase() === 'y') {
      console.log('\n' + '='.repeat(50) + '\n');
      await createSuperAdmin();
    }
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    rl.close();
    mongoose.connection.close();
  }
};

// Helper function to get permissions based on admin type
const getPermissionsForType = (adminType) => {
  switch(adminType) {
    case '1': // Super Admin
      return [
        { resource: 'products', actions: ['read', 'create', 'update', 'delete', 'manage'] },
        { resource: 'categories', actions: ['read', 'create', 'update', 'delete', 'manage'] },
        { resource: 'orders', actions: ['read', 'create', 'update', 'delete', 'manage'] },
        { resource: 'users', actions: ['read', 'create', 'update', 'delete', 'manage'] },
        { resource: 'analytics', actions: ['read', 'manage'] },
        { resource: 'settings', actions: ['read', 'create', 'update', 'delete', 'manage'] },
        { resource: 'admin_management', actions: ['read', 'create', 'update', 'delete', 'manage'] }
      ];
    case '2': // Regular Admin
      return [
        { resource: 'products', actions: ['read', 'create', 'update', 'delete'] },
        { resource: 'categories', actions: ['read', 'create', 'update', 'delete'] },
        { resource: 'orders', actions: ['read', 'create', 'update', 'delete'] },
        { resource: 'users', actions: ['read', 'create', 'update', 'delete'] },
        { resource: 'analytics', actions: ['read'] },
        { resource: 'settings', actions: ['read', 'create', 'update', 'delete'] }
      ];
    case '3': // Manager
      return [
        { resource: 'products', actions: ['read', 'create', 'update', 'delete'] },
        { resource: 'categories', actions: ['read', 'create', 'update'] },
        { resource: 'orders', actions: ['read', 'update'] },
        { resource: 'analytics', actions: ['read'] }
      ];
    case '4': // Support
      return [
        { resource: 'orders', actions: ['read', 'update'] },
        { resource: 'users', actions: ['read'] },
        { resource: 'analytics', actions: ['read'] }
      ];
    default:
      return [
        { resource: 'products', actions: ['read', 'create', 'update', 'delete'] },
        { resource: 'categories', actions: ['read', 'create', 'update', 'delete'] },
        { resource: 'orders', actions: ['read', 'create', 'update', 'delete'] },
        { resource: 'users', actions: ['read', 'create', 'update', 'delete'] },
        { resource: 'analytics', actions: ['read'] },
        { resource: 'settings', actions: ['read', 'create', 'update', 'delete'] }
      ];
  }
};

// Start the script
createSuperAdmin();
