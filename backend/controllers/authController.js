const jwt = require('jsonwebtoken');
const User = require('../models/users');
const crypto = require('crypto');
require('dotenv').config();

// Check if JWT_SECRET exists
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not defined in environment variables!');
  console.error('This will cause authentication to fail.');
}

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000 
};

// Store reset tokens (in production, use Redis or database)
const resetTokens = new Map();

const signupUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    console.log('=== SIGNUP ATTEMPT ===');
    console.log('Request body:', { username, email, hasPassword: !!password });

    if (!email) {
      console.log('Email is required');
      return res.status(400).json({ message: 'Email is required' });
    }

    const existingUserQuery = { email };
    if (username) {
      existingUserQuery.$or = [{ email }, { username }];
    }

    console.log('Checking for existing user with query:', JSON.stringify(existingUserQuery, null, 2));

    if (await User.findOne(existingUserQuery)) {
      console.log('User already exists');
      return res.status(400).json({ message: 'User already exists' });
    }

          console.log('Creating new user...');
    const newUser = await User.create({ 
      username: username || '', // Use empty string if no username provided
      email: email,
      password
    });

          console.log('User created successfully:', {
      id: newUser._id,
      email: newUser.email,
      username: newUser.username,
      hasPassword: !!newUser.password,
      passwordLength: newUser.password ? newUser.password.length : 0
    });

    const token = jwt.sign(
      { id: newUser._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    res.cookie('jwt', token, cookieOptions);
          console.log('Signup successful, token created');
    console.log('=== SIGNUP SUCCESS ===');
    
    res.status(201).json({
      message: 'User created successfully',
      user: newUser.toJSON() 
    });

  } catch (error) {
    console.error('❌ Signup error:', error);
    res.status(500).json({ 
      message: 'Signup error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const loginUser = async (req, res) => {
  try {
    console.log('=== LOGIN ATTEMPT START ===');
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);
    
    const { email, username, password } = req.body;

    console.log('=== LOGIN ATTEMPT ===');
    console.log('Request body:', { email, username, hasPassword: !!password });
    console.log('Password length:', password ? password.length : 0);

    // Require at least one of username or email
    if (!username && !email) {
      console.log('No username or email provided');
      return res.status(400).json({ message: 'Username or email is required' });
    }

    // Find user by email or username
    const query = {
      $or: [
        email ? { email } : {},
        username ? { username } : {}
      ]
    };
    console.log('Database query:', JSON.stringify(query, null, 2));

    console.log('About to query database...');
    const user = await User.findOne(query).select('+password');
    console.log('Database query completed');

    if (!user) {
      console.log('User not found for login attempt');
      return res.status(401).json({ message: 'Invalid credentials' }); 
    }

    console.log('User found:', {
      id: user._id,
      email: user.email,
      username: user.username,
      hasPassword: !!user.password,
      passwordLength: user.password ? user.password.length : 0,
      passwordStartsWith: user.password ? user.password.substring(0, 7) : 'none'
    });

    console.log('About to compare passwords...');
    const passwordMatch = await user.comparePassword(password);
    console.log('Password comparison result:', passwordMatch);
    console.log('Input password:', password);

    if (!passwordMatch) {
      console.log('Password does not match');
      return res.status(401).json({ message: 'Invalid credentials' }); 
    }

    console.log('About to generate JWT token...');
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );
    console.log('JWT token generated successfully');

    console.log('About to set cookie...');
    res.cookie('jwt', token, cookieOptions);
    console.log('Cookie set successfully');
    
    console.log('Login successful for user:', user._id);
    console.log('=== LOGIN SUCCESS ===');
    
    res.json({
      message: 'Login successful',
      user: user.toJSON() 
    });

  } catch (error) {
    console.error('Login error:', error);
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

// Request password reset
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    // Store token (in production, save to database)
    resetTokens.set(resetToken, {
      userId: user._id,
      email: user.email,
      expiry: resetTokenExpiry
    });

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    
    // In development, return the URL
    console.log('Password reset URL:', resetUrl);
    
    res.json({ 
      message: 'If an account with that email exists, a password reset link has been sent.',
      resetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ message: 'Error requesting password reset' });
  }
};

// Reset password with token
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Get token data
    const tokenData = resetTokens.get(token);
    if (!tokenData) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Check if token is expired
    if (Date.now() > tokenData.expiry) {
      resetTokens.delete(token);
      return res.status(400).json({ message: 'Reset token has expired' });
    }

    // Find user
    const user = await User.findById(tokenData.userId);
    if (!user) {
      resetTokens.delete(token);
      return res.status(400).json({ message: 'User not found' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Remove used token
    resetTokens.delete(token);

    res.json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
};

// Verify reset token
const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    const tokenData = resetTokens.get(token);
    if (!tokenData) {
      return res.status(400).json({ message: 'Invalid reset token' });
    }

    if (Date.now() > tokenData.expiry) {
      resetTokens.delete(token);
      return res.status(400).json({ message: 'Reset token has expired' });
    }

    res.json({ message: 'Token is valid' });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ message: 'Error verifying token' });
  }
};

module.exports = {
  signupUser,
  loginUser,
  logoutUser,
  getMe,
  requestPasswordReset,
  resetPassword,
  verifyResetToken
};