const mongoose = require('mongoose');
const User = require('../models/users');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const makeUserAdmin = async (emailOrUsername) => {
  try {
    // Find user by email or username
    const user = await User.findOne({
      $or: [
        { email: emailOrUsername },
        { username: emailOrUsername }
      ]
    });

    if (!user) {
      console.log('User not found. Please check the email or username.');
      return;
    }

    // Update user to admin
    user.role = 'admin';
    user.isAdmin = true;
    await user.save();

    console.log(`✅ Successfully made ${user.username || user.email} an admin!`);
    console.log(`User ID: ${user._id}`);
    console.log(`Role: ${user.role}`);
    console.log(`isAdmin: ${user.isAdmin}`);
    
  } catch (error) {
    console.error('Error making user admin:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Get command line argument
const emailOrUsername = process.argv[2];

if (!emailOrUsername) {
  console.log('Usage: node makeAdmin.js <email_or_username>');
  console.log('Example: node makeAdmin.js john@example.com');
  console.log('Example: node makeAdmin.js john_doe');
  process.exit(1);
}

makeUserAdmin(emailOrUsername); 