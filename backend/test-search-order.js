require('dotenv').config();
const mongoose = require('mongoose');

async function testSearchOrder() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Test the same query that the login uses
    const query = {
      $or: [
        { email: 'keshaunjones48@gmail.com' }
      ]
    };
    
    console.log('🔍 Testing search order with query:', JSON.stringify(query, null, 2));
    
    // Test 1: Original Users collection
    console.log('\n1️⃣ Testing Original Users collection...');
    try {
      const usersCollection = db.collection('users');
      const originalUser = await usersCollection.findOne(query);
      if (originalUser) {
        console.log('✅ Found in Original Users:', {
          id: originalUser._id,
          email: originalUser.email,
          role: originalUser.role,
          isAdmin: originalUser.isAdmin
        });
      } else {
        console.log('❌ Not found in Original Users');
      }
    } catch (err) {
      console.log('❌ Error querying Original Users:', err.message);
    }
    
    // Test 2: Customer collection
    console.log('\n2️⃣ Testing Customer collection...');
    try {
      const { Customer } = require('./models/users');
      const customerUser = await Customer.findOne(query).select('+password');
      if (customerUser) {
        console.log('✅ Found in Customer:', {
          id: customerUser._id,
          email: customerUser.email,
          role: customerUser.role,
          isAdmin: customerUser.isAdmin
        });
      } else {
        console.log('❌ Not found in Customer');
      }
    } catch (err) {
      console.log('❌ Error querying Customer:', err.message);
    }
    
    // Test 3: Admin collection
    console.log('\n3️⃣ Testing Admin collection...');
    try {
      const { Admin } = require('./models/users');
      const adminUser = await Admin.findOne(query).select('+password');
      if (adminUser) {
        console.log('✅ Found in Admin:', {
          id: adminUser._id,
          email: adminUser.email,
          role: adminUser.role,
          isAdmin: adminUser.isAdmin
        });
      } else {
        console.log('❌ Not found in Admin');
      }
    } catch (err) {
      console.log('❌ Error querying Admin:', err.message);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

testSearchOrder();



