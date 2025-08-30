const mongoose = require('mongoose');
require('dotenv').config();

// Import the new role-based models
const { Customer, BusinessOwner, Manager, Support, Viewer, Admin } = require('./models/users');

async function recreateUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully');
    
    // Find and delete the problematic user
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
    
    if (user) {
      console.log(`User found in ${collectionName} collection, deleting...`);
      await user.deleteOne();
      console.log('User deleted successfully');
    } else {
      console.log('User not found in any collection');
    }
    
    // Now create a new user with the proper schema
    console.log('Creating new user with proper schema...');
    
    const newUserData = {
      email: 'keshaunjones48@gmail.com',
      username: 'keshaunjones48',
              password: 'testpassword123',
      firstName: 'Keshaun',
      lastName: 'Jones',
      role: 'customer',
      isActive: true,
      // Customer-specific fields
      customerId: 'CUST-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
      preferences: {
        theme: 'auto',
        language: 'en',
        emailNotifications: true,
        pushNotifications: true,
        favoriteCategories: [],
        favoriteBrands: [],
        preferredPaymentMethod: 'credit_card',
        marketingPreferences: {
          emailMarketing: true,
          smsMarketing: false,
          pushMarketing: true
        }
      },
      addresses: [],
      metrics: {
        totalOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0,
        customerSince: new Date(),
        loyaltyPoints: 0,
        tier: 'bronze'
      },
      referralCode: 'REF-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
      referredBy: null,
      referrals: [],
      supportTickets: []
    };
    
    const newUser = await Customer.create(newUserData);
    console.log('New user created successfully:', {
      id: newUser._id,
      email: newUser.email,
      username: newUser.username,
      hasPassword: !!newUser.password,
      hasComparePassword: typeof newUser.comparePassword === 'function',
      role: newUser.role,
      customerId: newUser.customerId
    });
    
    // Test the comparePassword method
    console.log('Testing comparePassword method...');
          const passwordMatch = await newUser.comparePassword('testpassword123');
    console.log('Password verification test:', passwordMatch ? 'SUCCESS' : 'FAILED');
    
    // Test login query
    console.log('Testing login query...');
    const foundUser = await Customer.findOne({ email: 'keshaunjones48@gmail.com' }).select('+password');
    if (foundUser) {
      console.log('Login query test:', {
        id: foundUser._id,
        email: foundUser.email,
        hasPassword: !!foundUser.password,
        hasComparePassword: typeof foundUser.comparePassword === 'function',
        constructor: foundUser.constructor.name
      });
    }
    
  } catch (error) {
    console.error('Error recreating user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

recreateUser();
