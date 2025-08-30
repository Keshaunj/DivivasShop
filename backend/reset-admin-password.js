require('dotenv').config();
const mongoose = require('mongoose');
const { Admin } = require('./models/users');
const bcrypt = require('bcryptjs');

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
    console.log(`\n🔧 RESETTING ADMIN PASSWORD FOR: ${userEmail}`);
    console.log('=' .repeat(60));
    
    // Find the admin user
    const adminUser = await Admin.findOne({ email: userEmail.toLowerCase() });
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      process.exit(1);
    }
    
    console.log('\n📋 Current admin details:');
    console.log('ID:', adminUser._id);
    console.log('Email:', adminUser.email);
    console.log('Username:', adminUser.username);
    console.log('Admin Level:', adminUser.adminLevel);
    console.log('Current password hash:', adminUser.password ? adminUser.password.substring(0, 20) + '...' : 'No password');
    
    // Set new password to "checkout"
    const newPassword = 'checkout';
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    console.log('\n🔐 Setting new password...');
    console.log('New password:', newPassword);
    console.log('New hash starts with:', hashedPassword.substring(0, 20) + '...');
    
    // Update the admin user's password
    const updatedAdmin = await Admin.findByIdAndUpdate(
      adminUser._id,
      { password: hashedPassword },
      { new: true }
    );
    
    if (!updatedAdmin) {
      console.log('❌ Failed to update admin password');
      process.exit(1);
    }
    
    console.log('\n✅ Admin password updated successfully!');
    console.log('New password hash:', updatedAdmin.password.substring(0, 20) + '...');
    
    // Test password verification
    console.log('\n🧪 Testing password verification...');
    const isPasswordValid = await updatedAdmin.comparePassword(newPassword);
    console.log('Password verification test:', isPasswordValid ? '✅ PASSED' : '❌ FAILED');
    
    if (isPasswordValid) {
      console.log('\n🎉 SUCCESS! Admin can now log in with password: checkout');
      console.log('Try logging into the corporate portal now!');
    } else {
      console.log('\n❌ Password verification failed - something went wrong');
    }
    
  } catch (error) {
    console.error('❌ Error during password reset:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
});

