const express = require('express');
const bcrypt = require('bcrypt')
const User = require('../models/users')

const getUserDashboard = (req,res) => {
    res.json({
        message: 'Welcome to your Dashboard',
        user: {
            id: req.userser?.id || '',
            username: req.user?.username || ''
        }
    });
}

const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const updates = req.body;
    delete updates.password; 

    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId).select('-password'); 
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const changeUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user?.id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating password', error: error.message });
  }
};

const deleteUserAccount = async (req, res) => {
  try {
    const userId = req.user?.id;
    const deleted = await User.findByIdAndDelete(userId);
    if (!deleted) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete account', error: error.message });
  }
};

const addAddress = async (req, res) => {
  try {
    const userId = req.user?.id;
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
    const userId = req.user?.id;
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

    


