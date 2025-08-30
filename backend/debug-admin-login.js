require('dotenv').config();
const mongoose = require('mongoose');
const { Customer, BusinessOwner, Manager, Support, Viewer, Admin } = require('./models/users');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('🔗 Connected to MongoDB');
  
  try {
    const testEmail = 'keshaunjones48@gmail.com';
    console.log(`\n🔍 DEBUGGING ADMIN LOGIN FOR: ${testEmail}`);
    console.log('=' .repeat(60));
    
    // Step 1: Check if user exists in any collection
    console.log('\n📋 STEP 1: Checking user existence across all collections...');
    
    let user = null;
    let userCollection = null;
    
    // Check Customer collection
    user = await Customer.findOne({ email: testEmail.toLowerCase() }).select('+password');
    if (user) {
      userCollection = 'Customer';
      console.log('✅ Found in CUSTOMER collection');
    }
    
    // Check BusinessOwner collection
    if (!user) {
      user = await BusinessOwner.findOne({ email: testEmail.toLowerCase() }).select('+password');
      if (user) {
        userCollection = 'BusinessOwner';
        console.log('✅ Found in BUSINESSOWNER collection');
      }
    }
    
    // Check Manager collection
    if (!user) {
      user = await Manager.findOne({ email: testEmail.toLowerCase() }).select('+password');
      if (user) {
        userCollection = 'Manager';
        console.log('✅ Found in MANAGER collection');
      }
    }
    
    // Check Support collection
    if (!user) {
      user = await Support.findOne({ email: testEmail.toLowerCase() }).select('+password');
      if (user) {
        userCollection = 'Support';
        console.log('✅ Found in SUPPORT collection');
      }
    }
    
    // Check Viewer collection
    if (!user) {
      user = await Viewer.findOne({ email: testEmail.toLowerCase() }).select('+password');
      if (user) {
        userCollection = 'Viewer';
        console.log('✅ Found in VIEWER collection');
      }
    }
    
    // Check Admin collection
    if (!user) {
      user = await Admin.findOne({ email: testEmail.toLowerCase() }).select('+password');
      if (user) {
        userCollection = 'Admin';
        console.log('✅ Found in ADMIN collection');
      }
    }
    
    if (!user) {
      console.log('❌ User not found in ANY collection');
      process.exit(1);
    }
    
    console.log(`\n📋 STEP 2: User details from ${userCollection} collection:`);
    console.log('ID:', user._id);
    console.log('Email:', user.email);
    console.log('Username:', user.username);
    console.log('Role:', user.role);
    console.log('isAdmin:', user.isAdmin);
    console.log('isActive:', user.isActive);
    console.log('Permissions:', JSON.stringify(user.permissions, null, 2));
    console.log('Has password field:', !!user.password);
    
    // Step 3: Check admin access requirements
    console.log('\n📋 STEP 3: Checking admin access requirements...');
    
    const roleCheck = user.role === 'admin';
    const isAdminFlagCheck = user.isAdmin === true;
    const permissionsCheck = user.permissions && user.permissions.some(p => p.resource === 'admin_management');
    
    console.log('Role check (user.role === "admin"):', roleCheck);
    console.log('isAdmin flag check (user.isAdmin === true):', isAdminFlagCheck);
    console.log('Permissions check (admin_management):', permissionsCheck);
    
    const hasAdminAccess = roleCheck || isAdminFlagCheck || permissionsCheck;
    console.log('\n🔑 FINAL ADMIN ACCESS CHECK:', hasAdminAccess);
    
    if (!hasAdminAccess) {
      console.log('\n❌ REASON FOR 403 ERROR:');
      console.log('- User role is not "admin"');
      console.log('- isAdmin flag is not true');
      console.log('- No admin_management permissions found');
      console.log('\n💡 TO FIX: User needs one of these:');
      console.log('1. role: "admin"');
      console.log('2. isAdmin: true');
      console.log('3. permissions with resource: "admin_management"');
    } else {
      console.log('\n✅ User SHOULD have admin access!');
    }
    
    // Step 4: Check password (if we have it)
    if (user.password) {
      console.log('\n📋 STEP 4: Password field exists');
      console.log('Password hash length:', user.password.length);
      console.log('Password hash starts with:', user.password.substring(0, 10) + '...');
    } else {
      console.log('\n❌ STEP 4: No password field found');
      console.log('This will cause password verification to fail!');
    }
    
    // Step 5: Check if user is active
    console.log('\n📋 STEP 5: Account status check');
    console.log('isActive:', user.isActive);
    if (!user.isActive) {
      console.log('❌ Account is deactivated - this will cause login to fail');
    }
    
    // Step 6: Summary
    console.log('\n📋 STEP 6: SUMMARY OF ISSUES');
    console.log('=' .repeat(60));
    
    if (!hasAdminAccess) {
      console.log('🚫 MAIN ISSUE: User lacks admin privileges');
      console.log('   - Current role:', user.role);
      console.log('   - Current isAdmin:', user.isAdmin);
      console.log('   - Current permissions:', user.permissions ? user.permissions.length : 0);
    }
    
    if (!user.password) {
      console.log('🚫 PASSWORD ISSUE: No password field found');
    }
    
    if (!user.isActive) {
      console.log('🚫 ACCOUNT ISSUE: Account is deactivated');
    }
    
    console.log('\n💡 RECOMMENDED FIXES:');
    if (!hasAdminAccess) {
      console.log('1. Grant admin role: user.role = "admin"');
      console.log('2. Set admin flag: user.isAdmin = true');
      console.log('3. Add admin permissions: admin_management resource');
    }
    
    if (!user.password) {
      console.log('4. Reset user password to restore password field');
    }
    
    if (!user.isActive) {
      console.log('5. Activate account: user.isActive = true');
    }
    
  } catch (error) {
    console.error('❌ Error during debugging:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
});

