const mongoose = require('mongoose');
const User = require('./models/users');

// Connect to MongoDB
mongoose.connect('mongodb+srv://keshaunjones48:YOUR_PASSWORD@cluster-keshaunj.grqab.mongodb.net/CandleShop?retryWrites=true&w=majority&appName=Cluster-KeshaunJ', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const checkUsers = async () => {
  try {
    console.log('🔍 Checking all users in database...');
    
    const users = await User.find({});
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }
    
    console.log(`👥 Found ${users.length} users:`);
    
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. User: ${user.email || user.username}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   isAdmin: ${user.isAdmin}`);
      console.log(`   Permissions: ${user.permissions ? user.permissions.length : 0} permissions`);
      if (user.permissions) {
        user.permissions.forEach(perm => {
          console.log(`     - ${perm.resource}: ${perm.actions.join(', ')}`);
        });
      }
    });
    
  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    mongoose.connection.close();
  }
};

checkUsers();
