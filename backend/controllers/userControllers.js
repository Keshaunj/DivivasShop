const express = require('express');
const bcrypt = require('bcryptjs')
const { Customer, BusinessOwner, Manager, Support, Viewer, Admin } = require('../models/users')

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
      // Check across all collections
      const existingUser = await Promise.race([
        Customer.findOne({ username: updates.username, _id: { $ne: userId } }),
        BusinessOwner.findOne({ username: updates.username, _id: { $ne: userId } }),
        Manager.findOne({ username: updates.username, _id: { $ne: userId } }),
        Support.findOne({ username: updates.username, _id: { $ne: userId } }),
        Viewer.findOne({ username: updates.username, _id: { $ne: userId } }),
        Admin.findOne({ username: updates.username, _id: { $ne: userId } })
      ]);
      
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

    // Find and update user in the appropriate collection
    let updatedUser = await Customer.findByIdAndUpdate(userId, allowedUpdates, { new: true }).select('-password');
    if (!updatedUser) {
      updatedUser = await BusinessOwner.findByIdAndUpdate(userId, allowedUpdates, { new: true }).select('-password');
    }
    if (!updatedUser) {
      updatedUser = await Manager.findByIdAndUpdate(userId, allowedUpdates, { new: true }).select('-password');
    }
    if (!updatedUser) {
      updatedUser = await Support.findByIdAndUpdate(userId, allowedUpdates, { new: true }).select('-password');
    }
    if (!updatedUser) {
      updatedUser = await Viewer.findByIdAndUpdate(userId, allowedUpdates, { new: true }).select('-password');
    }
    if (!updatedUser) {
      updatedUser = await Admin.findByIdAndUpdate(userId, allowedUpdates, { new: true }).select('-password');
    }
    
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

    // Find user in any collection
    let user = await Customer.findById(userId).select('+password');
    if (!user) {
      user = await BusinessOwner.findById(userId).select('+password');
    }
    if (!user) {
      user = await Manager.findById(userId).select('+password');
    }
    if (!user) {
      user = await Support.findById(userId).select('+password');
    }
    if (!user) {
      user = await Viewer.findById(userId).select('+password');
    }
    if (!user) {
      user = await Admin.findById(userId).select('+password');
    }
    
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
    // Security: Don't log password details
    console.log('Password change request for user:', userId);

    // Validate input
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    // Find user in any collection
    let user = await Customer.findById(userId).select('+password');
    if (!user) {
      user = await BusinessOwner.findById(userId).select('+password');
    }
    if (!user) {
      user = await Manager.findById(userId).select('+password');
    }
    if (!user) {
      user = await Support.findById(userId).select('+password');
    }
    if (!user) {
      user = await Viewer.findById(userId).select('+password');
    }
    if (!user) {
      user = await Admin.findById(userId).select('+password');
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Security: Don't log password details

    // Check if user has a password (for users created without password)
    if (!user.password) {
      return res.status(400).json({ message: 'No current password found. Please contact support.' });
    }

    // Check if current password is correct
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    // Security: Don't log password details
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect. Please try again.' });
    }

    // Check if new password is different from current password
    const isNewPasswordSame = await bcrypt.compare(newPassword, user.password);
    if (isNewPasswordSame) {
      return res.status(400).json({ message: 'New password must be different from your current password' });
    }

    // Set the new password (pre-save hook will hash it)
    // Security: Don't log password details
    user.password = newPassword;

    await user.save();
    console.log('Password updated successfully for user:', userId);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Unable to update password. Please try again later.' });
  }
};

const deleteUserAccount = async (req, res) => {
  try {
    const userId = req.user?._id;
    // Find and delete user from the appropriate collection
    let deleted = await Customer.findByIdAndDelete(userId);
    if (!deleted) {
      deleted = await BusinessOwner.findByIdAndDelete(userId);
    }
    if (!deleted) {
      deleted = await Manager.findByIdAndDelete(userId);
    }
    if (!deleted) {
      deleted = await Support.findByIdAndDelete(userId);
    }
    if (!deleted) {
      deleted = await Viewer.findByIdAndDelete(userId);
    }
    if (!deleted) {
      deleted = await Admin.findByIdAndDelete(userId);
    }
    
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

    // Find user in any collection
    let user = await Customer.findById(userId);
    if (!user) {
      user = await BusinessOwner.findById(userId);
    }
    if (!user) {
      user = await Manager.findById(userId);
    }
    if (!user) {
      user = await Support.findById(userId);
    }
    if (!user) {
      user = await Viewer.findById(userId);
    }
    if (!user) {
      user = await Admin.findById(userId);
    }
    
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

    // Find user in any collection
    let user = await Customer.findById(userId);
    if (!user) {
      user = await BusinessOwner.findById(userId);
    }
    if (!user) {
      user = await Manager.findById(userId);
    }
    if (!user) {
      user = await Support.findById(userId);
    }
    if (!user) {
      user = await Viewer.findById(userId);
    }
    if (!user) {
      user = await Admin.findById(userId);
    }
    
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

    


