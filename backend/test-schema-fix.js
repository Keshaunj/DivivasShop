const mongoose = require('mongoose');
require('dotenv').config();

// Import the new role-based models
const { Customer, BusinessOwner, Manager, Support, Viewer, Admin } = require('./models/users');

async function testSchemaFix() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully');
    
    // Delete any existing test user
    await Customer.deleteOne({ email: 'keshaunjones48@gmail.com' });
    console.log('Deleted existing test user');
    
    // Create a new user with the fixed schema
    console.log('Creating new user with fixed schema...');
    
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
        constructor: foundUser.constructor.name,
        modelName: foundUser.constructor.modelName
      });
      
      // Test comparePassword on found user
      if (typeof foundUser.comparePassword === 'function') {
        console.log('Testing comparePassword on found user...');
        const foundPasswordMatch = await foundUser.comparePassword('testpassword123');
        console.log('Found user password verification:', foundPasswordMatch ? 'SUCCESS' : 'FAILED');
      } else {
        console.log('ERROR: Found user still missing comparePassword method');
      }
    }
    
  } catch (error) {
    console.error('Error testing schema fix:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testSchemaFix();
