const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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

async function resetPassword(emailOrUsername, newPassword) {
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

    // Hash the new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the password
    user.password = hashedPassword;
    await user.save();

    console.log('✅ Password reset successfully!');
    console.log('📧 Email/Username:', emailOrUsername);
    console.log('🔑 New password:', newPassword);
    console.log('💡 You can now log in with these credentials');

  } catch (error) {
    console.error('❌ Error resetting password:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Get command line arguments
const args = process.argv.slice(2);
if (args.length !== 2) {
  console.log('Usage: node resetPassword.js <email_or_username> <new_password>');
  console.log('Example: node resetPassword.js keshaunj21@gmail.com newpassword123');
  process.exit(1);
}

const [emailOrUsername, newPassword] = args;
resetPassword(emailOrUsername, newPassword); 