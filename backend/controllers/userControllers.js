const express = require('express');
const bcrypt = require('bcryptjs')
const User = require('../models/users')

const getUserDashboard = (req,res) => {
    res.json({
        message: 'Welcome to your Dashboard',
        user: {
            id: req.user?._id || '',
            username: req.user?.username || ''
        }
    });
}

const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const updates = req.body;
    delete updates.password; // Don't allow password updates through this route

    // Check if username is being updated and if it's unique
    if (updates.username) {
      const existingUser = await User.findOne({ 
        username: updates.username, 
        _id: { $ne: userId } // Exclude current user
      });
      
      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken. Please choose a different username.' });
      }
    }

    // Only allow specific fields to be updated
    const allowedUpdates = {
      firstName: updates.firstName,
      lastName: updates.lastName,
      username: updates.username,
      email: updates.email,
      phone: updates.phone,
      address: updates.address
    };

    const updatedUser = await User.findByIdAndUpdate(userId, allowedUpdates, { new: true }).select('-password');
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const changeUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user?._id;

  try {
    console.log('Password change request for user:', userId);
    console.log('Old password provided:', !!oldPassword);
    console.log('New password provided:', !!newPassword);

    // Validate input
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User found, has password:', !!user.password);

    // Check if user has a password (for users created without password)
    if (!user.password) {
      return res.status(400).json({ message: 'No current password found. Please contact support.' });
    }

    // Check if current password is correct
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    console.log('Password match result:', isMatch);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect. Please try again.' });
    }

    // Check if new password is different from current password
    const isNewPasswordSame = await bcrypt.compare(newPassword, user.password);
    if (isNewPasswordSame) {
      return res.status(400).json({ message: 'New password must be different from your current password' });
    }

    // Set the new password (pre-save hook will hash it)
    console.log('Setting new password, length:', newPassword.length);
    user.password = newPassword;

    await user.save();
    console.log('Password updated successfully for user:', userId);
    console.log('New password hash length:', user.password.length);
    console.log('New password hash starts with $2b$:', user.password.startsWith('$2b$'));

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Unable to update password. Please try again later.' });
  }
};

const deleteUserAccount = async (req, res) => {
  try {
    const userId = req.user?._id;
    const deleted = await User.findByIdAndDelete(userId);
    if (!deleted) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete account', error: error.message });
  }
};

const addAddress = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { street, city, state, zip, country } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.address && user.address.street) {
      return res.status(400).json({ message: 'Address already exists. Use update instead.' });
    }

    user.address = { street, city, state, zip, country };
    await user.save();

    res.json({ message: 'Address added successfully', address: user.address });
  } catch (error) {
    res.status(500).json({ message: 'Error adding address', error: error.message });
  }
};

const updateAddress = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { street, city, state, zip, country } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.address = {
      ...user.address, 
      street: street || user.address.street,
      city: city || user.address.city,
      state: state || user.address.state,
      zip: zip || user.address.zip,
      country: country || user.address.country
    };

    await user.save();
    res.json({ message: 'Address updated successfully', address: user.address });
  } catch (error) {
    res.status(500).json({ message: 'Error updating address', error: error.message });
  }
};


module.exports ={
    getUserDashboard,
    getUserProfile,
    updateUserProfile,
    changeUserPassword,
    deleteUserAccount,
    addAddress,
    updateAddress
}

    


