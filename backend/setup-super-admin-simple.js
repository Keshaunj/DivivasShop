require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');

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
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Import the Admin model
const { Admin } = require('./models/users');

const createSuperAdmin = async () => {
  try {
    console.log('🔐 Setting up Super Admin...\n');
    
    // Get user input
    const email = await question('📧 Enter email for super admin: ');
    const password = await question('🔑 Enter password for super admin: ');
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

    console.log('\n⏳ Creating super admin user...');
    
    // Create super admin user
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const newAdmin = new Admin({
      username: email.split('@')[0],
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'admin',
      isAdmin: true,
      adminLevel: 'super_admin',
      superadmin: true,
      permissions: [
        { resource: 'products', actions: ['read', 'create', 'update', 'delete', 'manage'] },
        { resource: 'categories', actions: ['read', 'create', 'update', 'delete', 'manage'] },
        { resource: 'orders', actions: ['read', 'create', 'update', 'delete', 'manage'] },
        { resource: 'users', actions: ['read', 'create', 'update', 'delete', 'manage'] },
        { resource: 'analytics', actions: ['read', 'manage'] },
        { resource: 'settings', actions: ['read', 'create', 'update', 'delete', 'manage'] },
        { resource: 'admin_management', actions: ['read', 'create', 'update', 'delete', 'manage'] }
      ],
      isActive: true,
      adminStatus: 'active'
    });

    await newAdmin.save();
    
    console.log('\n✅ Super Admin created successfully!');
    console.log('📧 Email:', email);
    console.log('👑 Role: Super Admin');
    console.log('🔑 Password: [Your chosen password]');
    console.log('🚀 You can now use manage-admins.js to promote other users!');
    
  } catch (error) {
    console.error('❌ Error creating super admin:', error);
  } finally {
    rl.close();
    mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
};

// Run the script
createSuperAdmin();

