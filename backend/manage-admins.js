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

const findSuperAdminAcrossCollections = async () => {
  const superAdmin = await User.findOne({
    $or: [{ role: 'admin', isAdmin: true }, { 'adminProfile.superadmin': true }]
  });
  return { superAdmin, collectionName: superAdmin ? superAdmin.role : null };
};

const showMainMenu = async () => {
  try {
    // Check for super admin across all collections
    const { superAdmin, collectionName } = await findSuperAdminAcrossCollections();
    
    if (!superAdmin) {
      console.log('\n❌ No super admin found. Please run setup-super-admin.js first.');
      console.log('💡 Or promote an existing user to super admin in their collection.');
      rl.close();
      mongoose.connection.close();
      return;
    }
    
    console.log(`\n✅ Super Admin found: ${superAdmin.email} (in ${collectionName} collection)`);
    
    // Get current admin count across all collections
    let totalAdminCount = 0;
    
    totalAdminCount = await User.countDocuments({
      $or: [{ role: 'admin' }, { isAdmin: true }]
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('👑 ADMIN MANAGEMENT CONSOLE');
    console.log('='.repeat(60));
    console.log(`🔍 Found ${totalAdminCount} total admin users across all collections`);
    
    const menuOptions = [];
    
    // Always show these options
    menuOptions.push('1. 📊 View All Admins (All Collections)');
    menuOptions.push('2. ➕ Create New Admin');
    
    // Only show edit/remove options if there are admins
    if (totalAdminCount > 0) {
      menuOptions.push('3. ✏️  Edit Admin Permissions');
      menuOptions.push('4. 🗑️  Remove Admin Role');
      menuOptions.push('5. 🔍 Search Admins');
      menuOptions.push('6. 📋 View Admin Details');
    }
    
    // Always show exit
    const exitOption = totalAdminCount > 0 ? '7' : '3';
    menuOptions.push(`${exitOption}. 🚪 Exit`);
    
    // Display menu
    menuOptions.forEach(option => console.log(option));
    console.log('='.repeat(60));
    
    // Dynamic choice prompt
    const maxChoice = totalAdminCount > 0 ? 7 : 3;
    const choice = await question(`\nEnter your choice (1-${maxChoice}): `);
    
    // Handle choices based on available options
    if (totalAdminCount > 0) {
      switch(choice) {
        case '1':
          await viewAllAdmins();
          break;
        case '2':
          await createNewAdmin();
          break;
        case '3':
          await editAdminPermissions();
          break;
        case '4':
          await removeAdminRole();
          break;
        case '5':
          await searchAdmins();
          break;
        case '6':
          await viewAdminDetails();
          break;
        case '7':
          console.log('👋 Goodbye!');
          rl.close();
          mongoose.connection.close();
          return;
        default:
          console.log(`❌ Invalid choice. Please enter a number between 1-${maxChoice}.`);
          await showMainMenu();
      }
    } else {
      // No admins exist yet
      switch(choice) {
        case '1':
          await viewAllAdmins();
          break;
        case '2':
          await createNewAdmin();
          break;
        case '3':
          console.log('👋 Goodbye!');
          rl.close();
          mongoose.connection.close();
          return;
        default:
          console.log('❌ Invalid choice. Please enter 1, 2, or 3.');
          await showMainMenu();
      }
    }
  } catch (error) {
    console.error('❌ Error in main menu:', error);
    await showMainMenu();
  }
};

const viewAllAdmins = async () => {
  try {
    console.log('\n📊 ALL ADMINS IN SYSTEM');
    console.log('-'.repeat(50));
    
    const admins = await User.find({ 
      $or: [{ role: 'admin' }, { isAdmin: true }] 
    }).sort({ createdAt: -1 });
    
    if (admins.length === 0) {
      console.log('❌ No admins found in the system.');
      await showMainMenu();
      return;
    }
    
    admins.forEach((admin, index) => {
      console.log(`\n${index + 1}. 👤 ${admin.username || 'No username'} (${admin.email})`);
      console.log(`   Role: ${admin.role} | Super Admin: ${admin.isAdmin ? 'Yes' : 'No'}`);
      console.log(`   Status: ${admin.isActive ? 'Active' : 'Inactive'}`);
      console.log(`   Created: ${admin.createdAt.toLocaleDateString()}`);
      console.log(`   Permissions: ${admin.permissions?.length || 0} resources`);
    });
    
    await showMainMenu();
  } catch (error) {
    console.error('❌ Error viewing admins:', error.message);
    await showMainMenu();
  }
};

const createNewAdmin = async () => {
  try {
    console.log('\n➕ CREATE NEW ADMIN');
    console.log('-'.repeat(30));
    
    const email = await question('📧 Enter email for new admin: ');
    const password = await question('🔑 Enter password for new admin: ');
    const confirmPassword = await question('🔑 Confirm password: ');
    
    // Validation
    if (!email || !email.includes('@')) {
      console.log('❌ Please enter a valid email address');
      await showMainMenu();
      return;
    }
    
    if (password !== confirmPassword) {
      console.log('❌ Passwords do not match');
      await showMainMenu();
      return;
    }
    
    if (password.length < 6) {
      console.log('❌ Password must be at least 6 characters long');
      await showMainMenu();
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log(`👤 User found: ${existingUser.email}`);
      console.log(`   Current role: ${existingUser.role} | Admin: ${existingUser.isAdmin ? 'Yes' : 'No'}`);
      
      // Check if user is already an admin
      if (existingUser.role === 'admin' || existingUser.isAdmin) {
        console.log('❌ This user is already an admin. Choose a different email or use "Edit Admin Permissions" to modify them.');
        await showMainMenu();
        return;
      }
      
      console.log('\n⏳ Upgrading existing user to admin...');
    } else {
      console.log('\n⏳ Creating new admin user...');
    }

    // Choose admin type
    console.log('\n👑 Choose admin type:');
    console.log('1. Super Admin (full platform access + can manage other admins)');
    console.log('2. Regular Admin (business owner access)');
    console.log('3. Manager (limited business access)');
    console.log('4. Support (customer support access)');
    
    const adminType = await question('\nEnter your choice (1-4): ');
    
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

    // If upgrading existing user, show what they're upgrading to and confirm
    if (existingUser) {
      const adminTypeName = adminType === '1' ? 'Super Admin' : 
                           adminType === '2' ? 'Regular Admin' : 
                           adminType === '3' ? 'Manager' : 'Support';
      
      console.log(`\n🚀 Upgrading user to: ${adminTypeName}`);
      console.log(`   Role: ${role} | Admin Access: ${isAdmin ? 'Yes' : 'No'}`);
      console.log(`   Permissions: ${permissions.length} resources`);
      
      // Ask for final confirmation
      const confirmUpgrade = await question('\n🤔 Confirm upgrade to admin? (yes/no): ');
      if (confirmUpgrade.toLowerCase() !== 'yes' && confirmUpgrade.toLowerCase() !== 'y') {
        console.log('❌ Operation cancelled.');
        await showMainMenu();
        return;
      }
    }

    if (existingUser) {
      await User.findByIdAndUpdate(existingUser._id, {
        role: role,
        isAdmin: isAdmin,
        'adminProfile.permissions': permissions,
        adminNotes: `Upgraded to ${role} on ${new Date().toISOString()}`
      });
      
      console.log('\n✅ User upgraded to admin successfully!');
      console.log('📧 Email:', email);
      console.log('👑 New Role:', role);
      console.log('📋 Permissions:', permissions.length, 'resources');
    } else {
      const hashedPassword = await bcrypt.hash(password, 12);
      await User.create({
        username: email.split('@')[0],
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: role,
        isAdmin: isAdmin,
        adminProfile: { permissions },
        isActive: true
      });
      
      console.log('\n✅ Admin user created successfully!');
      console.log('📧 Email:', email);
      console.log('👑 Role:', role);
      console.log('🔑 Password: [Your chosen password]');
      console.log('📋 Permissions:', permissions.length, 'resources');
    }
    
    // Show permission summary
    console.log('\n📋 Permission Summary:');
    permissions.forEach(perm => {
      console.log(`   ${perm.resource}: ${perm.actions.join(', ')}`);
    });
    
    await showMainMenu();
  } catch (error) {
    console.error('❌ Error creating/upgrading admin:', error.message);
    await showMainMenu();
  }
};

const editAdminPermissions = async () => {
  try {
    console.log('\n✏️  EDIT ADMIN PERMISSIONS');
    console.log('-'.repeat(35));
    
    const email = await question('📧 Enter admin email to edit: ');
    const admin = await User.findOne({ email: email.toLowerCase() });
    
    if (!admin) {
      console.log('❌ Admin not found');
      await showMainMenu();
      return;
    }
    
    console.log(`\n👤 Found admin: ${admin.username || 'No username'} (${admin.email})`);
    console.log(`   Current role: ${admin.role} | Super Admin: ${admin.isAdmin ? 'Yes' : 'No'}`);
    
    console.log('\n👑 Choose new admin type:');
    console.log('1. Super Admin (full platform access + can manage other admins)');
    console.log('2. Regular Admin (business owner access)');
    console.log('3. Manager (limited business access)');
    console.log('4. Support (customer support access)');
    console.log('5. Regular User (remove admin access)');
    
    const adminType = await question('\nEnter your choice (1-5): ');
    
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
      case '5':
        role = 'user';
        isAdmin = false;
        permissions = [];
        break;
      default:
        console.log('❌ Invalid choice');
        await showMainMenu();
        return;
    }

    await User.findByIdAndUpdate(admin._id, {
      role: role,
      isAdmin: isAdmin,
      'adminProfile.permissions': permissions,
      adminNotes: `Role updated to ${role} on ${new Date().toISOString()}`
    });
    
    console.log(`\n✅ Admin updated successfully!`);
    console.log(`   New role: ${role} | Super Admin: ${isAdmin ? 'Yes' : 'No'}`);
    
    await showMainMenu();
  } catch (error) {
    console.error('❌ Error updating admin:', error.message);
    await showMainMenu();
  }
};

const removeAdminRole = async () => {
  try {
    console.log('\n🗑️  REMOVE ADMIN ROLE');
    console.log('-'.repeat(30));
    
    // First, show current admins
    const currentAdmins = await User.find({ 
      $or: [{ role: 'admin' }, { isAdmin: true }] 
    }).sort({ createdAt: -1 });
    
    if (currentAdmins.length === 0) {
      console.log('❌ No admins found in the system.');
      await showMainMenu();
      return;
    }
    
    console.log('👥 Current Admins:');
    currentAdmins.forEach((admin, index) => {
      console.log(`   ${index + 1}. ${admin.email} (${admin.role}${admin.isAdmin ? ' + Super Admin' : ''})`);
    });
    
    const email = await question('\n📧 Enter admin email to remove role: ');
    const admin = await User.findOne({ email: email.toLowerCase() });
    
    if (!admin) {
      console.log('❌ User not found');
      await showMainMenu();
      return;
    }
    
    // Check if they're actually an admin
    if (admin.role !== 'admin' && !admin.isAdmin) {
      console.log('❌ This user is not an admin');
      await showMainMenu();
      return;
    }
    
    console.log(`\n👤 Found admin: ${admin.username || 'No username'} (${admin.email})`);
    console.log(`   Current role: ${admin.role} | Super Admin: ${admin.isAdmin ? 'Yes' : 'No'}`);
    
    // Show what will happen
    console.log('\n⚠️  This will:');
    console.log('   • Change role from "admin" to "user"');
    console.log('   • Remove Super Admin privileges');
    console.log('   • Clear all admin permissions');
    console.log('   • Keep the user account active');
    
    const confirm = await question('\n⚠️  Are you sure you want to remove admin role? (yes/no): ');
    
    if (confirm.toLowerCase() === 'yes' || confirm.toLowerCase() === 'y') {
      console.log('\n⏳ Removing admin role...');
      
      await User.findByIdAndUpdate(admin._id, {
        role: 'customer',
        isAdmin: false,
        'adminProfile.permissions': [],
        adminNotes: `Admin role removed on ${new Date().toISOString()}`
      });
      
      console.log('✅ Admin role removed successfully!');
      console.log(`👤 ${admin.email} is now a regular user`);
      
      // Check if this was the last admin
      const remainingAdmins = await User.countDocuments({ 
        $or: [{ role: 'admin' }, { isAdmin: true }] 
      });
      
      if (remainingAdmins === 0) {
        console.log('\n⚠️  WARNING: No admins remaining in the system!');
        console.log('   You may need to create a new admin to continue managing the system.');
      }
    } else {
      console.log('❌ Operation cancelled');
    }
    
    await showMainMenu();
  } catch (error) {
    console.error('❌ Error removing admin role:', error.message);
    await showMainMenu();
  }
};

const searchAdmins = async () => {
  try {
    console.log('\n🔍 SEARCH ADMINS');
    console.log('-'.repeat(20));
    
    const searchTerm = await question('🔍 Enter search term (email, username, or role): ');
    
    const admins = await User.find({
      $and: [
        { $or: [{ role: 'admin' }, { isAdmin: true }] },
        {
          $or: [
            { email: { $regex: searchTerm, $options: 'i' } },
            { username: { $regex: searchTerm, $options: 'i' } },
            { role: { $regex: searchTerm, $options: 'i' } }
          ]
        }
      ]
    });
    
    if (admins.length === 0) {
      console.log('❌ No admins found matching your search');
      await showMainMenu();
      return;
    }
    
    console.log(`\n🔍 Found ${admins.length} admin(s):`);
    admins.forEach((admin, index) => {
      console.log(`\n${index + 1}. 👤 ${admin.username || 'No username'} (${admin.email})`);
      console.log(`   Role: ${admin.role} | Super Admin: ${admin.isAdmin ? 'Yes' : 'No'}`);
      console.log(`   Status: ${admin.isActive ? 'Active' : 'Inactive'}`);
    });
    
    await showMainMenu();
  } catch (error) {
    console.error('❌ Error searching admins:', error.message);
    await showMainMenu();
  }
};

const viewAdminDetails = async () => {
  try {
    console.log('\n📋 VIEW ADMIN DETAILS');
    console.log('-'.repeat(25));
    
    const email = await question('📧 Enter admin email to view details: ');
    const admin = await User.findOne({ email: email.toLowerCase() });
    
    if (!admin) {
      console.log('❌ Admin not found');
      await showMainMenu();
      return;
    }
    
    console.log('\n📋 ADMIN DETAILS');
    console.log('-'.repeat(20));
    console.log(`👤 Username: ${admin.username || 'No username'}`);
    console.log(`📧 Email: ${admin.email}`);
    console.log(`👑 Role: ${admin.role}`);
    console.log(`🚀 Super Admin: ${admin.isAdmin ? 'Yes' : 'No'}`);
    console.log(`✅ Status: ${admin.isActive ? 'Active' : 'Inactive'}`);
    console.log(`📅 Created: ${admin.createdAt.toLocaleDateString()}`);
    console.log(`📝 Notes: ${admin.adminNotes || 'None'}`);
    
    if (admin.permissions && admin.permissions.length > 0) {
      console.log('\n🔐 PERMISSIONS:');
      admin.permissions.forEach((perm, index) => {
        console.log(`   ${index + 1}. ${perm.resource}: ${perm.actions.join(', ')}`);
      });
    } else {
      console.log('\n🔐 PERMISSIONS: None');
    }
    
    await showMainMenu();
  } catch (error) {
    console.error('❌ Error viewing admin details:', error.message);
    await showMainMenu();
  }
};

// Start the admin management console
const startAdminManagement = async () => {
  try {
    console.log('🔐 Starting Admin Management Console...');
    
    // Check for super admin across all collections
    const { superAdmin, collectionName } = await findSuperAdminAcrossCollections();
    
    if (!superAdmin) {
      console.log('❌ No super admin found. Please run setup-super-admin.js first.');
      rl.close();
      mongoose.connection.close();
      return;
    }

    console.log('✅ Super Admin found:', superAdmin.email);
    console.log('🚀 Starting admin management console...\n');
    
    await showMainMenu();
  } catch (error) {
    console.error('❌ Error starting admin management:', error.message);
    rl.close();
    mongoose.connection.close();
  }
};

// Run the admin management console
startAdminManagement();
