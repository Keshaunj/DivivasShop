const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb+srv://keshaunjones48:YOUR_PASSWORD@cluster-keshaunj.grqab.mongodb.net/CandleShop?retryWrites=true&w=majority&appName=Cluster-KeshaunJ', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const checkCollections = async () => {
  try {
    console.log('🔍 Checking collections in CandleShop database...');
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log('❌ No collections found in database');
      return;
    }
    
    console.log(`📚 Found ${collections.length} collections:`);
    
    collections.forEach((collection, index) => {
      console.log(`${index + 1}. ${collection.name}`);
    });
    
    // Check if there's a users collection
    const usersCollection = collections.find(c => c.name === 'users');
    if (usersCollection) {
      console.log('\n✅ Found users collection');
      
      // Count documents in users collection
      const userCount = await mongoose.connection.db.collection('users').countDocuments();
      console.log(`👥 Users count: ${userCount}`);
      
      if (userCount > 0) {
        // Get first user to see structure
        const firstUser = await mongoose.connection.db.collection('users').findOne({});
        console.log('\n🔍 First user structure:', JSON.stringify(firstUser, null, 2));
      }
    } else {
      console.log('\n❌ No users collection found');
    }
    
  } catch (error) {
    console.error('❌ Error checking collections:', error);
  } finally {
    mongoose.connection.close();
  }
};

checkCollections();
