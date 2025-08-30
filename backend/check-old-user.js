require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define the old user schema
const oldUserSchema = new mongoose.Schema({
  username: String,
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  phone: String,
  role: String,
  isAdmin: Boolean,
  // ... other fields
});

const OldUsers = mongoose.model('User', oldUserSchema, 'users-old');

async function checkOldUser() {
  try {
    console.log('🔍 Searching for old admin user...');
    
    // Find the old admin user
    const oldUser = await OldUsers.findOne({ 
      email: 'keshaunjones48@gmail.com' 
    });
    
    if (!oldUser) {
      console.log('❌ No old user found with that email');
      return;
    }
    
    console.log('✅ Old user found:', {
      id: oldUser._id,
      email: oldUser.email,
      username: oldUser.username,
      role: oldUser.role,
      isAdmin: oldUser.isAdmin,
      hasPassword: !!oldUser.password,
      passwordLength: oldUser.password ? oldUser.password.length : 0,
      passwordStartsWith: oldUser.password ? oldUser.password.substring(0, 10) + '...' : 'No password'
    });
    
    // Test password
    if (oldUser.password) {
          console.log('\n🔍 Testing password "testpassword123"...');
    const isMatch = await bcrypt.compare('testpassword123', oldUser.password);
      console.log('Password match:', isMatch);
      
      if (!isMatch) {
        console.log('\n🔍 Testing with original password from your data...');
        // Try the password from your original data
        const originalPassword = 'testpassword123'; // Test password
        const isMatchOriginal = await bcrypt.compare(originalPassword, oldUser.password);
        console.log('Original password match:', isMatchOriginal);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkOldUser();


