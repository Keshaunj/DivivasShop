const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/users');
require('dotenv').config();

async function debugAuth() {
  // Production safety check
  if (process.env.NODE_ENV === 'production') {
    console.log('DEBUG SCRIPT BLOCKED: This script is for development only!');
    console.log('   Remove or rename this file in production environments.');
    return;
  }

  try {
    console.log('=== AUTH DEBUG START (DEV ONLY) ===');
    
    // Check JWT_SECRET
    console.log('1. JWT_SECRET check:');
    if (process.env.JWT_SECRET) {
      console.log('JWT_SECRET is set (length:', process.env.JWT_SECRET.length, ')');
    } else {
      console.log('JWT_SECRET is missing!');
      return;
    }

    // Connect to MongoDB
    console.log('\n2. MongoDB connection:');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Test password hashing
    console.log('\n3. Password hashing test:');
    const testPassword = 'password123';
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(testPassword, salt);
    console.log('Password hashed successfully (length:', hashedPassword.length, ')');
    
    // Test password comparison
    const isMatch = await bcrypt.compare(testPassword, hashedPassword);
    console.log('Password comparison works:', isMatch);

    // Check existing users (SAFE - no sensitive data)
    console.log('\n4. User count check:');
    const userCount = await User.countDocuments({});
    console.log('Found', userCount, 'users in database');
    
    // Check if any users have passwords
    const usersWithPasswords = await User.countDocuments({ password: { $exists: true, $ne: null } });
    console.log('Users with passwords:', usersWithPasswords);

    // Test JWT token creation (SAFE - no real user data)
    console.log('\n5. JWT token test:');
    const testPayload = { id: 'test-user-id', test: true };
    const token = jwt.sign(testPayload, process.env.JWT_SECRET, { expiresIn: '1d' });
    console.log('JWT token created successfully (length:', token.length, ')');
    
    // Test token verification
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('JWT token verified successfully');

    // Test cookie options
    console.log('\n6. Cookie options test:');
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 
    };
    console.log('Cookie options configured');

    console.log('\n=== AUTH DEBUG COMPLETE ===');
    console.log('REMEMBER: This script is for development only!');

  } catch (error) {
    console.error('Debug error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

debugAuth(); 