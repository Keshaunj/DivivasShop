const mongoose = require('mongoose');
require('dotenv').config();

// Import the new role-based models
const { Customer, BusinessOwner, Manager, Support, Viewer, Admin } = require('./models/users');

async function testDatabaseConnection() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully');
    
    // Test querying each collection
    console.log('\n=== Testing Collections ===');
    
    // Test Customer collection
    try {
      const customers = await Customer.find({}).limit(3);
      console.log(`Customer collection: ${customers.length} documents found`);
      if (customers.length > 0) {
        console.log('Sample customer:', {
          id: customers[0]._id,
          email: customers[0].email,
          username: customers[0].username,
          hasPassword: !!customers[0].password,
          hasComparePassword: typeof customers[0].comparePassword === 'function',
          constructor: customers[0].constructor.name
        });
      }
    } catch (err) {
      console.log('Error querying Customer collection:', err.message);
    }
    
    // Test BusinessOwner collection
    try {
      const businessOwners = await BusinessOwner.find({}).limit(3);
      console.log(`BusinessOwner collection: ${businessOwners.length} documents found`);
      if (businessOwners.length > 0) {
        console.log('Sample business owner:', {
          id: businessOwners[0]._id,
          email: businessOwners[0].email,
          username: businessOwners[0].username,
          hasPassword: !!businessOwners[0].password,
          hasComparePassword: typeof businessOwners[0].comparePassword === 'function',
          constructor: businessOwners[0].constructor.name
        });
      }
    } catch (err) {
      console.log('Error querying BusinessOwner collection:', err.message);
    }
    
    // Test Admin collection
    try {
      const admins = await Admin.find({}).limit(3);
      console.log(`Admin collection: ${admins.length} documents found`);
      if (admins.length > 0) {
        console.log('Sample admin:', {
          id: admins[0]._id,
          email: admins[0].email,
          username: admins[0].username,
          hasPassword: !!admins[0].password,
          hasComparePassword: typeof admins[0].comparePassword === 'function',
          constructor: admins[0].constructor.name
        });
      }
    } catch (err) {
      console.log('Error querying Admin collection:', err.message);
    }
    
    // Test Manager collection
    try {
      const managers = await Manager.find({}).limit(3);
      console.log(`Manager collection: ${managers.length} documents found`);
    } catch (err) {
      console.log('Error querying Manager collection:', err.message);
    }
    
    // Test Support collection
    try {
      const support = await Support.find({}).limit(3);
      console.log(`Support collection: ${support.length} documents found`);
    } catch (err) {
      console.log('Error querying Support collection:', err.message);
    }
    
    // Test Viewer collection
    try {
      const viewers = await Viewer.find({}).limit(3);
      console.log(`Viewer collection: ${viewers.length} documents found`);
    } catch (err) {
      console.log('Error querying Viewer collection:', err.message);
    }
    
    // Test specific user lookup (the one from the error logs)
    console.log('\n=== Testing Specific User Lookup ===');
    const testEmail = 'keshaunjones48@gmail.com';
    
    let foundUser = null;
    let foundCollection = null;
    
    try {
      foundUser = await Customer.findOne({ email: testEmail });
      if (foundUser) foundCollection = 'Customer';
    } catch (err) {
      console.log('Error finding user in Customer:', err.message);
    }
    
    if (!foundUser) {
      try {
        foundUser = await BusinessOwner.findOne({ email: testEmail });
        if (foundUser) foundCollection = 'BusinessOwner';
      } catch (err) {
        console.log('Error finding user in BusinessOwner:', err.message);
      }
    }
    
    if (!foundUser) {
      try {
        foundUser = await Manager.findOne({ email: testEmail });
        if (foundUser) foundCollection = 'Manager';
      } catch (err) {
        console.log('Error finding user in Manager:', err.message);
      }
    }
    
    if (!foundUser) {
      try {
        foundUser = await Support.findOne({ email: testEmail });
        if (foundUser) foundCollection = 'Support';
      } catch (err) {
        console.log('Error finding user in Support:', err.message);
      }
    }
    
    if (!foundUser) {
      try {
        foundUser = await Viewer.findOne({ email: testEmail });
        if (foundUser) foundCollection = 'Viewer';
      } catch (err) {
        console.log('Error finding user in Viewer:', err.message);
      }
    }
    
    if (!foundUser) {
      try {
        foundUser = await Admin.findOne({ email: testEmail });
        if (foundUser) foundCollection = 'Admin';
      } catch (err) {
        console.log('Error finding user in Admin:', err.message);
      }
    }
    
    if (foundUser) {
      console.log(`User found in ${foundCollection} collection:`);
      console.log({
        id: foundUser._id,
        email: foundUser.email,
        username: foundUser.username,
        hasPassword: !!foundUser.password,
        hasComparePassword: typeof foundUser.comparePassword === 'function',
        constructor: foundUser.constructor.name,
        modelName: foundUser.constructor.modelName
      });
    } else {
      console.log('User not found in any collection');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testDatabaseConnection();

