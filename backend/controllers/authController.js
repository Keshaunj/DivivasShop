const jwt = require('jsonwebtoken');
const User = require('../models/users');
const crypto = require('crypto');
require('dotenv').config();

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not defined in environment variables!');
}

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000
};

const resetTokens = new Map();

const signupUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const existingUserQuery = { email };
    if (username) {
      existingUserQuery.$or = [{ email }, { username }];
    }

    const existingUser = await User.findOne(existingUserQuery);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = await User.create({
      username: username || '',
      email,
      password,
      role: 'customer'
    });

    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.cookie('jwt', token, cookieOptions);
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: newUser.toJSON()
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      message: 'Signup error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, username, identifier, password } = req.body;
    const userEmail = email || identifier;
    const userUsername = username;

    if (!userEmail && !userUsername) {
      return res.status(400).json({ message: 'Username or email is required' });
    }

    const query = {
      $or: [
        userEmail ? { email: userEmail.toLowerCase ? userEmail.toLowerCase() : userEmail } : {},
        userUsername ? { username: userUsername } : {}
      ].filter(condition => Object.keys(condition).length > 0)
    };

    const user = await User.findOne(query).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
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
      user: user.toJSON(),
      token
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

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000;
    resetTokens.set(resetToken, {
      userId: user._id,
      email: user.email,
      expiry: resetTokenExpiry
    });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    if (process.env.NODE_ENV === 'development') {
      console.log('Password reset URL:', resetUrl);
    }

    res.json({
      message: 'If an account with that email exists, a password reset link has been sent.',
      resetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ message: 'Error requesting password reset' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const tokenData = resetTokens.get(token);
    if (!tokenData) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    if (Date.now() > tokenData.expiry) {
      resetTokens.delete(token);
      return res.status(400).json({ message: 'Reset token has expired' });
    }

    const user = await User.findById(tokenData.userId);
    if (!user) {
      resetTokens.delete(token);
      return res.status(400).json({ message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();
    resetTokens.delete(token);
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
};

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
