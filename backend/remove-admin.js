const mongoose = require('mongoose');
const readline = require('readline');
require('dotenv').config();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to get user input
const question = (query) => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/divias-shop', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require('./models/users');

const removeAdmin = async () => {
  try {
    console.log('🔴 Admin Removal Tool\n');
    
    // Get the email of the admin to remove
    const email = await question('📧 Enter email of admin to remove: ');
    
    if (!email || !email.includes('@')) {
      console.log('❌ Please enter a valid email address');
      rl.close();
      return;
    }

    // Find the user
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log('❌ User not found with that email');
      rl.close();
      return;
    }

    if (user.role !== 'admin' && !user.isAdmin) {
      console.log('❌ This user is not an admin');
      rl.close();
      return;
    }

    console.log('\n👤 User Found:');
    console.log('   Email:', user.email);
    console.log('   Username:', user.username);
    console.log('   Role:', user.role);
    console.log('   Is Admin:', user.isAdmin);
    console.log('   Permissions:', user.permissions?.length || 0, 'permissions');

    // Ask what action to take
    console.log('\n🔴 What would you like to do?');
    console.log('1. Demote to regular user (keep account, remove admin access)');
    console.log('2. Delete user completely (permanent removal)');
    console.log('3. Cancel operation');
    
    const action = await question('\nEnter your choice (1, 2, or 3): ');

    if (action === '1') {
      // Demote to regular user
      const confirm = await question('\n⚠️  Are you sure you want to demote this admin? (yes/no): ');
      
      if (confirm.toLowerCase() === 'yes' || confirm.toLowerCase() === 'y') {
        await User.findByIdAndUpdate(user._id, {
          role: 'user',
          isAdmin: false,
          permissions: [],
          adminNotes: `Admin role removed on ${new Date().toISOString()}`
        });
        
        console.log('✅ Admin successfully demoted to regular user');
        console.log('📝 User can still login but has no admin access');
      } else {
        console.log('❌ Operation cancelled');
      }
      
    } else if (action === '2') {
      // Delete user completely
      const confirm = await question('\n🚨 WARNING: This will permanently delete the user! Are you sure? (yes/no): ');
      
      if (confirm.toLowerCase() === 'yes' || confirm.toLowerCase() === 'y') {
        const finalConfirm = await question('🚨 FINAL WARNING: Type "DELETE" to confirm permanent deletion: ');
        
        if (finalConfirm === 'DELETE') {
          await User.findByIdAndDelete(user._id);
          console.log('✅ User permanently deleted from system');
        } else {
          console.log('❌ Deletion cancelled - confirmation text did not match');
        }
      } else {
        console.log('❌ Deletion cancelled');
      }
      
    } else if (action === '3') {
      console.log('❌ Operation cancelled');
    } else {
      console.log('❌ Invalid choice');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
    mongoose.connection.close();
  }
};

// Run the removal tool
removeAdmin();

