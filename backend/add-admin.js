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

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/divias-shop', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require('./models/users');

const addAdmin = async () => {
  try {
    console.log('👑 Add Additional Admin User\n');
    
    // Check if super admin exists
    const superAdmin = await User.findOne({ role: 'admin', isAdmin: true });
    if (!superAdmin) {
      console.log('❌ No super admin found. Please run setup-super-admin.js first.');
      rl.close();
      return;
    }

    console.log('✅ Super Admin found:', superAdmin.email);
    console.log('You can now add additional admin users.\n');

    // Get user input
    const email = await question('📧 Enter email for new admin: ');
    const password = await question('🔑 Enter password for new admin: ');
    const confirmPassword = await question('🔑 Confirm password: ');
    
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

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('❌ User with this email already exists');
      rl.close();
      return;
    }

    // Choose admin role
    console.log('\n👑 Choose admin role:');
    console.log('1. Admin (full access based on permissions)');
    console.log('2. Manager (limited access, typically products & orders)');
    console.log('3. Support (customer support access)');
    console.log('4. Viewer (read-only access to analytics)');
    
    const roleChoice = await question('\nEnter your choice (1-4): ');
    
    let role, permissions;
    
    switch(roleChoice) {
      case '1':
        role = 'admin';
        permissions = [
          { resource: 'products', actions: ['read', 'create', 'update', 'delete'] },
          { resource: 'categories', actions: ['read', 'create', 'update', 'delete'] },
          { resource: 'orders', actions: ['read', 'update'] },
          { resource: 'users', actions: ['read', 'update'] },
          { resource: 'analytics', actions: ['read'] },
          { resource: 'settings', actions: ['read', 'update'] }
        ];
        break;
      case '2':
        role = 'manager';
        permissions = [
          { resource: 'products', actions: ['read', 'create', 'update', 'delete'] },
          { resource: 'categories', actions: ['read', 'create', 'update'] },
          { resource: 'orders', actions: ['read', 'update'] },
          { resource: 'analytics', actions: ['read'] }
        ];
        break;
      case '3':
        role = 'support';
        permissions = [
          { resource: 'orders', actions: ['read', 'update'] },
          { resource: 'users', actions: ['read'] },
          { resource: 'analytics', actions: ['read'] }
        ];
        break;
      case '4':
        role = 'viewer';
        permissions = [
          { resource: 'analytics', actions: ['read'] },
          { resource: 'products', actions: ['read'] },
          { resource: 'orders', actions: ['read'] }
        ];
        break;
      default:
        console.log('❌ Invalid choice, defaulting to Manager role');
        role = 'manager';
        permissions = [
          { resource: 'products', actions: ['read', 'create', 'update', 'delete'] },
          { resource: 'categories', actions: ['read', 'create', 'update'] },
          { resource: 'orders', actions: ['read', 'update'] },
          { resource: 'analytics', actions: ['read'] }
        ];
    }

    console.log('\n⏳ Creating admin user...');
    
    // Create admin user
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const newAdmin = new User({
      username: email.split('@')[0], // Use email prefix as username
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: role,
      isAdmin: false, // Not a super admin
      permissions: permissions,
      invitedBy: superAdmin._id,
      invitedAt: new Date(),
      isActive: true
    });

    await newAdmin.save();
    
    console.log('\n✅ Admin user created successfully!');
    console.log('📧 Email:', email);
    console.log('👑 Role:', role);
    console.log('🔑 Password: [Your chosen password]');
    console.log('📋 Permissions:', permissions.length, 'resources');
    console.log('\n🚀 New admin can now login to the admin panel!');
    
    // Show permission summary
    console.log('\n📋 Permission Summary:');
    permissions.forEach(perm => {
      console.log(`   ${perm.resource}: ${perm.actions.join(', ')}`);
    });
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    rl.close();
    mongoose.connection.close();
  }
};

// Run the add admin tool
addAdmin();

