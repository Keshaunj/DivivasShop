const mongoose = require('mongoose');
const User = require('./models/users');

// Connect to MongoDB
mongoose.connect('mongodb+srv://keshaunjones48:YOUR_PASSWORD@cluster-keshaunj.grqab.mongodb.net/CandleShop?retryWrites=true&w=majority&appName=Cluster-KeshaunJ', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const fixUserPermissions = async () => {
  try {
    console.log('🔍 Checking user permissions...');
    
    // Find the admin user
    const adminUser = await User.findOne({ email: 'keshaunjones48@gmail.com' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('👤 Found user:', adminUser.email);
    console.log('🔑 Current role:', adminUser.role);
    console.log('🔑 Current isAdmin:', adminUser.isAdmin);
    console.log('🔑 Current permissions:', adminUser.permissions);
    
    // Set up proper permissions for Super Admin
    const superAdminPermissions = [
      { resource: 'products', actions: ['read', 'create', 'update', 'delete'] },
      { resource: 'categories', actions: ['read', 'create', 'update', 'delete'] },
      { resource: 'orders', actions: ['read', 'create', 'update', 'delete'] },
      { resource: 'users', actions: ['read', 'create', 'update', 'delete'] },
      { resource: 'analytics', actions: ['read'] },
      { resource: 'settings', actions: ['read', 'update'] },
      { resource: 'admin_management', actions: ['read', 'create', 'update', 'delete'] }
    ];
    
    // Update user with proper permissions
    adminUser.permissions = superAdminPermissions;
    adminUser.role = 'admin';
    adminUser.isAdmin = true;
    
    await adminUser.save();
    
    console.log('✅ User permissions updated successfully!');
    console.log('🔑 New role:', adminUser.role);
    console.log('🔑 New isAdmin:', adminUser.isAdmin);
    console.log('🔑 New permissions:', adminUser.permissions);
    
  } catch (error) {
    console.error('❌ Error fixing user permissions:', error);
  } finally {
    mongoose.connection.close();
  }
};

fixUserPermissions();
