const mongoose = require('mongoose');
require('dotenv').config();

const { Customer } = require('./models/users');

async function debugPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Find user with password field
    const user = await Customer.findOne({ email: 'keshaunjones48@gmail.com' }).select('+password');
    
    if (user) {
      console.log('User found:');
      console.log('- ID:', user._id);
      console.log('- Email:', user.email);
      console.log('- Password exists:', !!user.password);
      console.log('- Password length:', user.password ? user.password.length : 0);
      console.log('- Password starts with:', user.password ? user.password.substring(0, 10) : 'none');
      console.log('- Has comparePassword method:', typeof user.comparePassword === 'function');
      
      // Test password comparison
      if (typeof user.comparePassword === 'function') {
        console.log('\nTesting password comparison...');
        const match = await user.comparePassword('testpassword123');
        console.log('Password match:', match);
      }
    } else {
      console.log('User not found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

debugPassword();
