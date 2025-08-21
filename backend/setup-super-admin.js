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

const createSuperAdmin = async () => {
  try {
    console.log('🔐 Setting up Admin User...\n');
    
    // Check if super admin already exists
    const existingAdmin = await User.findOne({ role: 'admin', isAdmin: true });
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
    const email = await question('\n📧 Enter email for new admin: ');
    const password = await question('🔑 Enter password for new admin: ');
    const confirmPassword = await question('🔑 Confirm password: ');
    
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

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    let role, isAdmin, permissions;
    
    switch(adminType) {
      case '1':
        role = 'admin';
        isAdmin = true;
        permissions = [
          { resource: 'products', actions: ['read', 'create', 'update', 'delete', 'manage'] },
          { resource: 'categories', actions: ['read', 'create', 'update', 'delete', 'manage'] },
          { resource: 'orders', actions: ['read', 'create', 'update', 'delete', 'manage'] },
          { resource: 'users', actions: ['read', 'create', 'update', 'delete', 'manage'] },
          { resource: 'analytics', actions: ['read', 'manage'] },
          { resource: 'settings', actions: ['read', 'create', 'update', 'delete', 'manage'] },
          { resource: 'admin_management', actions: ['read', 'create', 'update', 'delete', 'manage'] }
        ];
        break;
      case '2':
        role = 'admin';
        isAdmin = false;
        permissions = [
          { resource: 'products', actions: ['read', 'create', 'update', 'delete'] },
          { resource: 'categories', actions: ['read', 'create', 'update', 'delete'] },
          { resource: 'orders', actions: ['read', 'update'] },
          { resource: 'users', actions: ['read', 'update'] },
          { resource: 'analytics', actions: ['read'] },
          { resource: 'settings', actions: ['read', 'update'] }
        ];
        break;
      case '3':
        role = 'manager';
        isAdmin = false;
        permissions = [
          { resource: 'products', actions: ['read', 'create', 'update', 'delete'] },
          { resource: 'categories', actions: ['read', 'create', 'update'] },
          { resource: 'orders', actions: ['read', 'update'] },
          { resource: 'analytics', actions: ['read'] }
        ];
        break;
      case '4':
        role = 'support';
        isAdmin = false;
        permissions = [
          { resource: 'orders', actions: ['read', 'update'] },
          { resource: 'users', actions: ['read'] },
          { resource: 'analytics', actions: ['read'] }
        ];
        break;
      default:
        console.log('❌ Invalid choice, defaulting to Regular Admin');
        role = 'admin';
        isAdmin = false;
        permissions = [
          { resource: 'products', actions: ['read', 'create', 'update', 'delete'] },
          { resource: 'categories', actions: ['read', 'create', 'update', 'delete'] },
          { resource: 'orders', actions: ['read', 'update'] },
          { resource: 'users', actions: ['read', 'update'] },
          { resource: 'analytics', actions: ['read'] },
          { resource: 'settings', actions: ['read', 'update'] }
        ];
    }
    
    if (existingUser) {
      console.log(`👤 User found: ${existingUser.email}`);
      console.log(`   Current role: ${existingUser.role} | Admin: ${existingUser.isAdmin ? 'Yes' : 'No'}`);
      
      // Check if user is already a SUPER admin (we can still upgrade regular admins)
      if (existingUser.role === 'admin' && existingUser.isAdmin === true) {
        console.log('❌ This user is already a SUPER admin. Choose a different email or upgrade to a different role.');
        console.log('💡 You can still upgrade regular admins or create new users.');
        return;
      }
      
      // Show what they're upgrading to
      const adminTypeName = adminType === '1' ? 'Super Admin' : 
                           adminType === '2' ? 'Regular Admin' : 
                           adminType === '3' ? 'Manager' : 'Support';
      
      console.log(`\n🚀 Upgrading user to: ${adminTypeName}`);
      console.log(`   Role: ${role} | Admin Access: ${isAdmin ? 'Yes' : 'No'}`);
      console.log(`   Permissions: ${permissions.length} resources`);
      
      // Show current vs new status
      if (existingUser.role === 'admin' && existingUser.isAdmin === false) {
        console.log(`\n📝 Current Status: Regular Admin (role: admin, isAdmin: false)`);
        console.log(`📝 New Status: ${adminTypeName} (role: ${role}, isAdmin: ${isAdmin})`);
      } else {
        console.log(`\n📝 Current Status: ${existingUser.role} (isAdmin: ${existingUser.isAdmin})`);
        console.log(`📝 New Status: ${adminTypeName} (role: ${role}, isAdmin: ${isAdmin})`);
      }
      
      // Ask if they want to upgrade existing user
      const upgradeUser = await question('\n🤔 Do you want to upgrade this user to admin? (yes/no): ');
      if (upgradeUser.toLowerCase() === 'yes' || upgradeUser.toLowerCase() === 'y') {
        console.log('\n⏳ Upgrading existing user to admin...');
        
        // Update existing user with admin permissions
        await User.findByIdAndUpdate(existingUser._id, {
          role: role,
          isAdmin: isAdmin,
          permissions: permissions,
          invitedAt: new Date(),
          adminNotes: `Upgraded to ${role} on ${new Date().toISOString()}`
        });
        
        console.log('\n✅ User upgraded to admin successfully!');
        console.log('📧 Email:', email);
        console.log('👑 New Role:', role);
        console.log('📋 Permissions:', permissions.length, 'resources');
        
        // Show permission summary
        console.log('\n📋 Permission Summary:');
        permissions.forEach(perm => {
          console.log(`   ${perm.resource}: ${perm.actions.join(', ')}`);
        });
        
        // Ask if they want to create another admin
        const createAnother = await question('\n🤔 Create/upgrade another admin? (yes/no): ');
        if (createAnother.toLowerCase() === 'yes' || createAnother.toLowerCase() === 'y') {
          console.log('\n' + '='.repeat(50) + '\n');
          await createSuperAdmin(); // Recursive call to create another
        }
        return;
      } else {
        console.log('❌ Operation cancelled. Please choose a different email.');
        return;
      }
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
      isAdmin: isAdmin,
      permissions: permissions,
      invitedBy: existingAdmin ? existingAdmin._id : null,
      invitedAt: new Date(),
      isActive: true
    });

    await newAdmin.save();
    
    console.log('\n✅ Admin user created successfully!');
    console.log('📧 Email:', email);
    console.log('👑 Role:', role);
    console.log('🔑 Password: [Your chosen password]');
    console.log('📋 Permissions:', permissions.length, 'resources');
    console.log('🚀 New admin can now login to the admin panel!');
    
    // Show permission summary
    console.log('\n📋 Permission Summary:');
    permissions.forEach(perm => {
      console.log(`   ${perm.resource}: ${perm.actions.join(', ')}`);
    });
    
    // Ask if they want to create another admin
    const createAnother = await question('\n🤔 Create another admin? (yes/no): ');
    if (createAnother.toLowerCase() === 'yes' || createAnother.toLowerCase() === 'y') {
      console.log('\n' + '='.repeat(50) + '\n');
      await createSuperAdmin(); // Recursive call to create another
    }
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    rl.close();
    mongoose.connection.close();
  }
};

// Run the setup
createSuperAdmin();
