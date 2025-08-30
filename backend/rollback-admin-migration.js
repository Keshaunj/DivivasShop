const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const { Admin } = require('./models/users');
const oldUserModel = require('./models/users-old');

async function rollbackAdminMigration() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully');
    
    console.log('=== ADMIN MIGRATION ROLLBACK START ===');
    
    // Step 1: Find the migration backup
    const backupCollection = mongoose.connection.collection('admin_migration_backup');
    const backup = await backupCollection.findOne({ 
      'originalData.email': 'keshaunjones48@gmail.com' 
    });
    
    if (!backup) {
      console.log('❌ Migration backup not found');
      return;
    }
    
    console.log('✅ Migration backup found:', {
      originalUserId: backup.originalUserId,
      migratedAt: backup.migratedAt,
      newAdminId: backup.newAdminId
    });
    
    // Step 2: Delete the new admin user
    const newAdmin = await Admin.findById(backup.newAdminId);
    if (newAdmin) {
      await newAdmin.deleteOne();
      console.log('✅ New admin user deleted');
    }
    
    // Step 3: Restore the old admin user if it was modified
    const oldAdmin = await oldUserModel.findById(backup.originalUserId);
    if (oldAdmin) {
      console.log('✅ Original admin user still exists in old schema');
      console.log('   You can continue using the old system');
    } else {
      console.log('⚠️ Original admin user not found in old schema');
      console.log('   You may need to restore from a database backup');
    }
    
    // Step 4: Clean up migration backup
    await backupCollection.deleteOne({ _id: backup._id });
    console.log('✅ Migration backup cleaned up');
    
    console.log('\n=== ROLLBACK COMPLETE ===');
    console.log('🔑 You can now use the original admin system');
    console.log('   Email: keshaunjones48@gmail.com');
    console.log('   Use your original password');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

rollbackAdminMigration();
