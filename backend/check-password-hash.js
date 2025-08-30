require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function checkPasswordHash() {
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
      passwordLength: originalUser.password ? originalUser.password.length : 0
    });
    
    // Show the full password hash
    if (originalUser.password) {
      console.log('\n🔍 Full password hash:');
      console.log(originalUser.password);
      
      // Try to identify the password pattern
      console.log('\n🔍 Password hash analysis:');
      console.log('Hash starts with: $2b$12$ (bcrypt with 12 salt rounds)');
      console.log('Hash length: 60 characters (correct for bcrypt)');
      
      // Try some more password variations
      console.log('\n🔍 Testing more password variations...');
      const testPasswords = [
        'keshaun',
        'jones',
        'keshaunjones',
        'keshaunjones48',
        'keshaun48',
        'jones48',
        'admin',
        'password',
        '123456',
        'qwerty',
        'abc123',
        'password123',
        'admin123',
        'root',
        'user',
        'login',
        'welcome',
        'hello',
        'hi',
        'test',
        'demo',
        'sample',
        'temp',
        'temporary',
        'pass',
        'secret',
        'private',
        'secure',
        'access',
        'login123',
        'user123',
        'admin1234',
        'password1234',
        '123456789',
        'qwerty123',
        'abc123456',
        'password123456',
        'admin123456',
        'root123',
        'user123456',
        'login123456',
        'welcome123',
        'hello123',
        'hi123',
        'test123',
        'demo123',
        'sample123',
        'temp123',
        'temporary123',
        'pass123',
        'secret123',
        'private123',
        'secure123',
        'access123'
      ];
      
      for (const testPass of testPasswords) {
        const match = await bcrypt.compare(testPass, originalUser.password);
        if (match) {
          console.log(`✅ Password found: "${testPass}"`);
          break;
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkPasswordHash();



