const mongoose = require('mongoose');
require('dotenv').config();

async function debugUserUpdate() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully!');
    
    const User = require('./models/users');
    
    // Find the user you're trying to update
    const user = await User.findOne({ email: 'admin@diviaswicka.com' });
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('\n👤 Current user state:');
    console.log('   ID:', user._id);
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   isActive:', user.isActive);
    console.log('   isAdmin:', user.isAdmin);
    
    // Test updating the user status directly
    console.log('\n🔄 Testing direct database update...');
    const updateResult = await User.findByIdAndUpdate(
      user._id,
      { isActive: false },
      { new: true }
    );
    
    console.log('✅ Direct update successful:');
    console.log('   New isActive value:', updateResult.isActive);
    
    // Verify the change
    const updatedUser = await User.findById(user._id);
    console.log('\n🔍 Verification - User after update:');
    console.log('   isActive:', updatedUser.isActive);
    
    // Test the API endpoint logic
    console.log('\n🧪 Testing API endpoint logic...');
    
    // Simulate the updateUserStatus function logic
    const testUserId = user._id;
    const testIsActive = false;
    
    // Check if user exists
    const testUser = await User.findById(testUserId);
    if (!testUser) {
      console.log('❌ User not found in API test');
      return;
    }
    
    // Check if user is super admin (prevent deactivating)
    if (testUser.role === 'admin' && testUser.isAdmin === true && !testIsActive) {
      console.log('❌ Cannot deactivate super admin user');
      return;
    }
    
    // Update user status
    const apiUpdateResult = await User.findByIdAndUpdate(
      testUserId,
      { isActive: testIsActive },
      { new: true }
    ).select('-password');
    
    console.log('✅ API update successful:');
    console.log('   New isActive value:', apiUpdateResult.isActive);
    
    // Final verification
    const finalUser = await User.findById(testUserId);
    console.log('\n🎯 Final verification:');
    console.log('   isActive:', finalUser.isActive);
    
  } catch (error) {
    console.error('💥 Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

debugUserUpdate();
