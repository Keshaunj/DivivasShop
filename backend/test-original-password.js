require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function testOriginalPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Find the original admin user
    const originalUser = await usersCollection.findOne({
      email: 'keshaunjones48@gmail.com'
    });
    
    if (!originalUser) {
      console.log('❌ No original user found');
      return;
    }
    
    console.log('✅ Original user found:', {
      id: originalUser._id,
      email: originalUser.email,
      username: originalUser.username,
      role: originalUser.role,
      isAdmin: originalUser.isAdmin,
      hasPassword: !!originalUser.password,
      passwordLength: originalUser.password ? originalUser.password.length : 0,
      passwordStartsWith: originalUser.password ? originalUser.password.substring(0, 10) + '...' : 'No password'
    });
    
    // Test the password
    if (originalUser.password) {
          console.log('\n🔍 Testing password "testpassword123"...');
    const isMatch = await bcrypt.compare('testpassword123', originalUser.password);
      console.log('Password match:', isMatch);
      
      if (!isMatch) {
        console.log('\n🔍 Testing with common passwords...');
        const testPasswords = [
          'password',
          '123456',
          'admin',
          'keshaun',
          'jones',
          'keshaunjones',
          'keshaunjones48',
          'TempPassword123',
          'TempPassword',
          'temp123',
          'temp',
          'test',
          'admin123'
        ];
        
        for (const testPass of testPasswords) {
          const match = await bcrypt.compare(testPass, originalUser.password);
          if (match) {
            console.log(`✅ Password found: "${testPass}"`);
            break;
          }
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

testOriginalPassword();


