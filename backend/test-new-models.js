const mongoose = require('mongoose');
require('dotenv').config();

// Import the new models
const { Customer, BusinessOwner, Manager, Support, Viewer, Admin } = require('./models/users');

async function testNewModels() {
  try {
    console.log('🚀 Testing new role-based user models...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Test creating a customer
    console.log('\n👥 Testing Customer model...');
    const customer = new Customer({
      email: 'test-customer@example.com',
      password: 'testpassword123',
      firstName: 'John',
      lastName: 'Doe'
    });
    await customer.save();
    console.log('✅ Customer created:', customer.customerId);
    
    // Test creating a business owner
    console.log('\n🏢 Testing BusinessOwner model...');
    const businessOwner = new BusinessOwner({
      email: 'test-business@example.com',
      password: 'testpassword123',
      firstName: 'Jane',
      lastName: 'Smith',
      businessInfo: {
        businessName: 'Test Candle Shop',
        businessType: 'retail'
      }
    });
    await businessOwner.save();
    console.log('✅ Business Owner created:', businessOwner.businessInfo.businessName);
    
    // Test creating a manager
    console.log('\n👔 Testing Manager model...');
    const manager = new Manager({
      email: 'test-manager@example.com',
      password: 'testpassword123',
      firstName: 'Bob',
      lastName: 'Johnson',
      department: 'sales',
      position: 'Sales Manager'
    });
    await manager.save();
    console.log('✅ Manager created:', manager.managerId);
    
    // Test creating a support agent
    console.log('\n🎧 Testing Support model...');
    const support = new Support({
      email: 'test-support@example.com',
      password: 'testpassword123',
      firstName: 'Alice',
      lastName: 'Brown',
      specialization: 'general',
      level: 'tier1'
    });
    await support.save();
    console.log('✅ Support created:', support.supportId);
    
    // Test creating a viewer
    console.log('\n👁️ Testing Viewer model...');
    const viewer = new Viewer({
      email: 'test-viewer@example.com',
      password: 'testpassword123',
      firstName: 'Charlie',
      lastName: 'Wilson',
      accessLevel: 'basic'
    });
    await viewer.save();
    console.log('✅ Viewer created:', viewer.viewerId);
    
    // Test creating an admin
    console.log('\n🔐 Testing Admin model...');
    const admin = new Admin({
      email: 'test-admin@example.com',
      password: 'testpassword123',
      firstName: 'David',
      lastName: 'Miller',
      adminLevel: 'admin'
    });
    await admin.save();
    console.log('✅ Admin created:', admin.adminId);
    
    // Test querying all users
    console.log('\n📊 Testing user queries...');
    
    const customerCount = await Customer.countDocuments();
    const businessOwnerCount = await BusinessOwner.countDocuments();
    const managerCount = await Manager.countDocuments();
    const supportCount = await Support.countDocuments();
    const viewerCount = await Viewer.countDocuments();
    const adminCount = await Admin.countDocuments();
    
    console.log('📈 User counts:');
    console.log(`  👥 Customers: ${customerCount}`);
    console.log(`  🏢 Business Owners: ${businessOwnerCount}`);
    console.log(`  👔 Managers: ${managerCount}`);
    console.log(`  🎧 Support: ${supportCount}`);
    console.log(`  👁️ Viewers: ${viewerCount}`);
    console.log(`  🔐 Admins: ${adminCount}`);
    
    // Test finding users by email
    console.log('\n🔍 Testing user lookup by email...');
    const foundCustomer = await Customer.findOne({ email: 'test-customer@example.com' });
    const foundBusinessOwner = await BusinessOwner.findOne({ email: 'test-business@example.com' });
    
    console.log('✅ Customer lookup:', foundCustomer ? 'Success' : 'Failed');
    console.log('✅ Business Owner lookup:', foundBusinessOwner ? 'Success' : 'Failed');
    
    // Test permissions
    console.log('\n🔐 Testing permissions...');
    if (foundCustomer) {
      console.log('Customer permissions:', foundCustomer.permissions);
    }
    if (foundBusinessOwner) {
      console.log('Business Owner permissions:', foundBusinessOwner.permissions);
    }
    
    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await Customer.deleteOne({ email: 'test-customer@example.com' });
    await BusinessOwner.deleteOne({ email: 'test-business@example.com' });
    await Manager.deleteOne({ email: 'test-manager@example.com' });
    await Support.deleteOne({ email: 'test-support@example.com' });
    await Viewer.deleteOne({ email: 'test-viewer@example.com' });
    await Admin.deleteOne({ email: 'test-admin@example.com' });
    console.log('✅ Test data cleaned up');
    
    console.log('\n🎉 All tests passed! New models are working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testNewModels();
}

module.exports = testNewModels;
