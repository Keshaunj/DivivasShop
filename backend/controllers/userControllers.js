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




    


