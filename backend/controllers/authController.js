const jwt = require('jsonwebtoken');
const User = require('../models/users');
require('dotenv').config();

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000 
};

const signupUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Require at least one of username or email
    if (!username && !email) {
      return res.status(400).json({ message: 'Username or email is required' });
    }

    // Check if user exists by username or email
    if (await User.findOne({ $or: [{ email }, { username }] })) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = await User.create({ 
      username: username || email, // fallback to email if username not provided
      email: email || undefined,   // fallback to undefined if not provided
      password
    });

    const token = jwt.sign(
      { id: newUser._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    res.cookie('jwt', token, cookieOptions);
    res.status(201).json({
      message: 'User created successfully',
      user: newUser.toJSON() 
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Signup error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Require at least one of username or email
    if (!username && !email) {
      return res.status(400).json({ message: 'Username or email is required' });
    }

    // Find user by email or username
    const user = await User.findOne({
      $or: [
        email ? { email } : {},
        username ? { username } : {}
      ]
    }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' }); 
    }

    if (!(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' }); 
    }

    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    res.cookie('jwt', token, cookieOptions);
    res.json({
      message: 'Login successful',
      user: user.toJSON() 
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Login error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const logoutUser = (req, res) => {
  res.clearCookie('jwt');
  res.json({ message: 'Logged out successfully' });
};

const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    res.json({
      message: 'Authenticated',
      user: req.user
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Authentication check failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  signupUser,
  loginUser,
  logoutUser,
  getMe
};