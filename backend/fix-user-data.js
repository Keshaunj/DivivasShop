const mongoose = require('mongoose');
require('dotenv').config();

// Import the new role-based models
const { Customer, BusinessOwner, Manager, Support, Viewer, Admin } = require('./models/users');

async function fixUserData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully');
    
    // Find the problematic user
    const userId = '68adb6bd26c13be32e95716b';
    console.log(`Looking for user with ID: ${userId}`);
    
    // Check each collection for this user
    let user = await Customer.findById(userId);
    let collectionName = 'Customer';
    
    if (!user) {
      user = await BusinessOwner.findById(userId);
      collectionName = 'BusinessOwner';
    }
    if (!user) {
      user = await Manager.findById(userId);
      collectionName = 'Manager';
    }
    if (!user) {
      user = await Support.findById(userId);
      collectionName = 'Support';
    }
    if (!user) {
      user = await Viewer.findById(userId);
      collectionName = 'Viewer';
    }
    if (!user) {
      user = await Admin.findById(userId);
      collectionName = 'Admin';
    }
    
    if (!user) {
      console.log('User not found in any collection');
      return;
    }
    
    console.log(`User found in ${collectionName} collection`);
    console.log('Current user data:', {
      id: user._id,
      email: user.email,
      username: user.username,
      hasPassword: !!user.password,
      role: user.role
    });
    
    // Check if user has required fields
    if (!user.email || !user.password) {
      console.log('User is missing required authentication fields');
      console.log('Adding missing fields...');
      
      // Add missing fields
      if (!user.email) {
        user.email = 'keshaunjones48@gmail.com'; // Use the email from the login attempt
        console.log('Added email:', user.email);
      }
      
      if (!user.password) {
        // Generate a temporary password (user will need to reset it)
        const bcrypt = require('bcryptjs');
        const tempPassword = 'testpassword123';
        user.password = await bcrypt.hash(tempPassword, 12);
        console.log('Added temporary password (testpassword123)');
      }
      
      // Save the updated user
      await user.save();
      console.log('User updated successfully');
      
      // Verify the update
      const updatedUser = await mongoose.model(collectionName).findById(userId);
      console.log('Updated user data:', {
        id: updatedUser._id,
        email: updatedUser.email,
        username: updatedUser.username,
        hasPassword: !!updatedUser.password,
        hasComparePassword: typeof updatedUser.comparePassword === 'function',
        role: updatedUser.role
      });
      
    } else {
      console.log('User already has required authentication fields');
    }
    
  } catch (error) {
    console.error('Error fixing user data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

fixUserData();
