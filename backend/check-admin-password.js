const mongoose = require('mongoose');
require('dotenv').config();

const { Admin } = require('./models/users');

async function checkAdminPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Find the admin user
    const admin = await Admin.findOne({ email: 'keshaunjones48@gmail.com' }).select('+password');
    
    if (admin) {
      console.log('✅ Admin found:', {
        id: admin._id,
        email: admin.email,
        username: admin.username,
        hasPassword: !!admin.password,
        passwordLength: admin.password ? admin.password.length : 0,
        passwordStartsWith: admin.password ? admin.password.substring(0, 10) : 'none'
      });
      
      // Test password comparison
      console.log('\n🔍 Testing password comparison...');
      const testPassword = 'checkout';
      const passwordMatch = await admin.comparePassword(testPassword);
      console.log(`Password "${testPassword}" matches:`, passwordMatch);
      
      if (!passwordMatch) {
        console.log('\n❌ Password verification failed. Resetting password...');
        
        // Reset password
        admin.password = 'checkout';
        await admin.save();
        
        console.log('✅ Password reset to: checkout');
        
        // Test again
        const newPasswordMatch = await admin.comparePassword('checkout');
        console.log('New password verification:', newPasswordMatch ? 'SUCCESS' : 'FAILED');
      }
    } else {
      console.log('❌ Admin not found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkAdminPassword();

