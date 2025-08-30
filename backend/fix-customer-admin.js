require('dotenv').config();
const mongoose = require('mongoose');
const { Customer } = require('./models/users');

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
    const userEmail = 'keshaunjones48@gmail.com';
    console.log(`\n🔧 FIXING CUSTOMER ADMIN PRIVILEGES FOR: ${userEmail}`);
    console.log('=' .repeat(60));
    
    // Find the user in Customer collection
    const user = await Customer.findOne({ email: userEmail.toLowerCase() });
    
    if (!user) {
      console.log('❌ User not found in Customer collection');
      process.exit(1);
    }
    
    console.log('\n📋 Current Customer record:');
    console.log('ID:', user._id);
    console.log('Email:', user.email);
    console.log('Username:', user.username);
    console.log('Role:', user.role);
    console.log('isAdmin:', user.isAdmin);
    console.log('Permissions:', JSON.stringify(user.permissions, null, 2));
    
    // Update the Customer record with admin privileges
    console.log('\n🔑 Updating Customer record with admin privileges...');
    
    const updateData = {
      role: 'admin',
      isAdmin: true,
      permissions: [
        { resource: 'products', actions: ['read', 'create', 'update', 'delete'] },
        { resource: 'categories', actions: ['read', 'create', 'update', 'delete'] },
        { resource: 'orders', actions: ['read', 'create', 'update', 'delete'] },
        { resource: 'users', actions: ['read', 'create', 'update', 'delete'] },
        { resource: 'analytics', actions: ['read'] },
        { resource: 'settings', actions: ['read', 'update'] },
        { resource: 'admin_management', actions: ['read', 'create', 'update', 'delete'] }
      ]
    };
    
    console.log('Updating with:', JSON.stringify(updateData, null, 2));
    
    // Update the user
    const updatedUser = await Customer.findByIdAndUpdate(
      user._id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      console.log('❌ Failed to update user');
      process.exit(1);
    }
    
    console.log('\n✅ Customer record updated successfully!');
    console.log('New role:', updatedUser.role);
    console.log('New isAdmin:', updatedUser.isAdmin);
    console.log('New permissions count:', updatedUser.permissions.length);
    
    // Verify admin access logic
    console.log('\n🧪 Testing admin access logic...');
    
    const roleCheck = updatedUser.role === 'admin';
    const isAdminFlagCheck = updatedUser.isAdmin === true;
    const permissionsCheck = updatedUser.permissions && updatedUser.permissions.some(p => p.resource === 'admin_management');
    
    console.log('Role check (user.role === "admin"):', roleCheck);
    console.log('isAdmin flag check (user.isAdmin === true):', isAdminFlagCheck);
    console.log('Permissions check (admin_management):', permissionsCheck);
    
    const hasAdminAccess = roleCheck || isAdminFlagCheck || permissionsCheck;
    console.log('🔑 FINAL ADMIN ACCESS CHECK:', hasAdminAccess);
    
    if (hasAdminAccess) {
      console.log('\n🎉 SUCCESS! Customer now has admin access');
      console.log('You can now log in to the corporate portal with your regular password');
      console.log('You stay in Customer collection but with admin privileges');
    } else {
      console.log('\n❌ Something went wrong - user still lacks admin access');
    }
    
  } catch (error) {
    console.error('❌ Error during customer admin fix:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
});

