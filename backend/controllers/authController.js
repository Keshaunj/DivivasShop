const jwt = require('jsonwebtoken');
const User = require('../models/users');
const crypto = require('crypto');
const { sendPasswordResetEmail, sendWelcomeEmail } = require('../utils/email');
require('dotenv').config();

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

    // Require email (username is optional)
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user exists by email or username (if provided)
    const existingUserQuery = { email };
    if (username) {
      existingUserQuery.$or = [{ email }, { username }];
    }
    
    if (await User.findOne(existingUserQuery)) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = await User.create({ 
      username: username || '', // Use empty string if no username provided
      email: email,
      password
    });

    // Send welcome email
    try {
      await sendWelcomeEmail(email, username || email);
      console.log('Welcome email sent to:', email);
    } catch (emailError) {
      console.error('Welcome email failed:', emailError);
      // Don't fail signup if email fails
    }

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

    console.log('Login attempt for:', { email, username, hasPassword: !!password });

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
      console.log('User not found for login attempt');
      return res.status(401).json({ message: 'Invalid credentials' }); 
    }

    console.log('User found, has password:', !!user.password);
    console.log('Password field length:', user.password ? user.password.length : 0);
    console.log('Password field starts with $2b$:', user.password ? user.password.startsWith('$2b$') : false);

    const passwordMatch = await user.comparePassword(password);
    console.log('Password comparison result:', passwordMatch);
    console.log('Input password length:', password.length);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' }); 
    }

    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    res.cookie('jwt', token, cookieOptions);
    console.log('Login successful for user:', user._id);
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
    
    // Send real email
    try {
      await sendPasswordResetEmail(
        user.email, 
        resetUrl, 
        user.username || user.firstName || 'User'
      );
      
      console.log('Password reset email sent successfully to:', user.email);
      
      res.json({ 
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      
      // In development, still return the URL if email fails
      if (process.env.NODE_ENV === 'development') {
        res.json({ 
          message: 'Email sending failed, but here is your reset URL for testing:',
          resetUrl: resetUrl
        });
      } else {
        res.status(500).json({ message: 'Failed to send reset email. Please try again later.' });
      }
    }

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