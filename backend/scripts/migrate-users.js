const mongoose = require('mongoose');
require('dotenv').config();

// Import old and new models
const OldUser = require('../models/users'); // Old single user model
const { Customer, BusinessOwner, Manager, Support, Viewer, Admin } = require('../models/users/index');

// Migration script to separate users by role
async function migrateUsers() {
  try {
    console.log('🚀 Starting user migration...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get all users from old model
    const oldUsers = await OldUser.find({});
    console.log(`📊 Found ${oldUsers.length} users to migrate`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const oldUser of oldUsers) {
      try {
        const userData = oldUser.toObject();
        
        // Determine which model to use based on role
        let newUser;
        let modelName;
        
        switch (userData.role) {
          case 'customer':
          case 'user':
            newUser = new Customer({
              ...userData,
              role: 'customer'
            });
            modelName = 'Customer';
            break;
            
          case 'business_owner':
            newUser = new BusinessOwner({
              ...userData,
              role: 'business_owner'
            });
            modelName = 'BusinessOwner';
            break;
            
          case 'manager':
            newUser = new Manager({
              ...userData,
              role: 'manager',
              department: 'general', // Default department
              position: 'Manager' // Default position
            });
            modelName = 'Manager';
            break;
            
          case 'support':
            newUser = new Support({
              ...userData,
              role: 'support',
              specialization: 'general', // Default specialization
              level: 'tier1' // Default level
            });
            modelName = 'Support';
            break;
            
          case 'viewer':
            newUser = new Viewer({
              ...userData,
              role: 'viewer',
              accessLevel: 'basic' // Default access level
            });
            modelName = 'Viewer';
            break;
            
          case 'admin':
            newUser = new Admin({
              ...userData,
              role: 'admin',
              adminLevel: userData.isAdmin ? 'super_admin' : 'admin'
            });
            modelName = 'Admin';
            break;
            
          default:
            console.log(`⚠️  Unknown role: ${userData.role} for user ${userData.email}`);
            skippedCount++;
            continue;
        }
        
        // Save to new model
        await newUser.save();
        console.log(`✅ Migrated ${userData.email} to ${modelName}`);
        migratedCount++;
        
      } catch (error) {
        console.error(`❌ Error migrating user ${oldUser.email}:`, error.message);
        skippedCount++;
      }
    }
    
    console.log('\n🎉 Migration completed!');
    console.log(`✅ Successfully migrated: ${migratedCount} users`);
    console.log(`⚠️  Skipped: ${skippedCount} users`);
    
    // Show summary by role
    const customerCount = await Customer.countDocuments();
    const businessOwnerCount = await BusinessOwner.countDocuments();
    const managerCount = await Manager.countDocuments();
    const supportCount = await Support.countDocuments();
    const viewerCount = await Viewer.countDocuments();
    const adminCount = await Admin.countDocuments();
    
    console.log('\n📊 New database structure:');
    console.log(`👥 Customers: ${customerCount}`);
    console.log(`🏢 Business Owners: ${businessOwnerCount}`);
    console.log(`👔 Managers: ${managerCount}`);
    console.log(`🎧 Support: ${supportCount}`);
    console.log(`👁️  Viewers: ${viewerCount}`);
    console.log(`🔐 Admins: ${adminCount}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateUsers();
}

module.exports = migrateUsers;

