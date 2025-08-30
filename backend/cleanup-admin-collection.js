const mongoose = require('mongoose');
require('dotenv').config();

async function cleanupAdminCollection() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully');
    
    console.log('=== CLEANING UP ADMIN COLLECTION ===');
    
    // Find all admins with null or invalid emails
    const { Admin } = require('./models/users');
    const invalidAdmins = await Admin.find({
      $or: [
        { email: null },
        { email: { $exists: false } },
        { email: '' }
      ]
    });
    
    console.log(`Found ${invalidAdmins.length} invalid admin records`);
    
    if (invalidAdmins.length > 0) {
      // Delete invalid admin records
      for (const admin of invalidAdmins) {
        console.log(`Deleting admin with ID: ${admin._id}, email: ${admin.email}`);
        await admin.deleteOne();
      }
      console.log('✅ Invalid admin records cleaned up');
    }
    
    // Also clean up any test records
    const testAdmins = await Admin.find({
      $or: [
        { email: 'test@example.com' },
        { email: 'admin@test.com' }
      ]
    });
    
    if (testAdmins.length > 0) {
      console.log(`Found ${testAdmins.length} test admin records`);
      for (const admin of testAdmins) {
        console.log(`Deleting test admin: ${admin.email}`);
        await admin.deleteOne();
      }
      console.log('✅ Test admin records cleaned up');
    }
    
    // Show remaining admins
    const remainingAdmins = await Admin.find({});
    console.log(`\nRemaining admins: ${remainingAdmins.length}`);
    remainingAdmins.forEach(admin => {
      console.log(`- ${admin.email} (${admin.adminLevel || 'unknown'})`);
    });
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

cleanupAdminCollection();
