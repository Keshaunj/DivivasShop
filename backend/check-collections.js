require('dotenv').config();
const mongoose = require('mongoose');

async function checkCollections() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Get all collection names
    const collections = await db.listCollections().toArray();
    console.log('📚 Available collections:');
    collections.forEach(col => console.log(`  - ${col.name}`));
    
    // Check each collection for the admin user
    console.log('\n🔍 Searching for admin user in each collection...');
    
    for (const collection of collections) {
      if (collection.name === 'system.indexes' || collection.name === 'system.users') continue;
      
      try {
        const count = await db.collection(collection.name).countDocuments();
        console.log(`\n📊 Collection: ${collection.name} (${count} documents)`);
        
        if (count > 0) {
          // Look for admin user
          const adminUser = await db.collection(collection.name).findOne({
            email: 'keshaunjones48@gmail.com'
          });
          
          if (adminUser) {
            console.log(`✅ ADMIN USER FOUND in ${collection.name}!`);
            console.log('User details:', {
              id: adminUser._id,
              email: adminUser.email,
              username: adminUser.username,
              role: adminUser.role,
              isAdmin: adminUser.isAdmin
            });
          } else {
            console.log(`❌ No admin user found in ${collection.name}`);
          }
        }
      } catch (err) {
        console.log(`❌ Error checking ${collection.name}:`, err.message);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkCollections();
