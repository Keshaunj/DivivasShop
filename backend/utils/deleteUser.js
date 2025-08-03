const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/db-CandleShop')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// User model (simplified for this script)
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String
});

const User = mongoose.model('User', userSchema);

async function deleteUser(emailOrUsername) {
  try {
    // Find user by email or username
    const user = await User.findOne({
      $or: [
        { email: emailOrUsername },
        { username: emailOrUsername }
      ]
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ User found:', user.username || user.email);
    console.log('📧 Email:', user.email);
    console.log('👤 Username:', user.username);

    // Delete the user
    await User.findByIdAndDelete(user._id);
    console.log('✅ User deleted successfully!');
    console.log('💡 You can now create a new account');

  } catch (error) {
    console.error('❌ Error deleting user:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Get command line arguments
const args = process.argv.slice(2);
if (args.length !== 1) {
  console.log('Usage: node deleteUser.js <email_or_username>');
  console.log('Example: node deleteUser.js keshaunj21@gmail.com');
  console.log('Example: node deleteUser.js kzeroplays');
  process.exit(1);
}

const emailOrUsername = args[0];
deleteUser(emailOrUsername); 