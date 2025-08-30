const jwt = require('jsonwebtoken');
const { Customer, BusinessOwner, Manager, Support, Viewer, Admin } = require('../models/users');
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
    // Security: Don't log password details
    console.log('Signup request received for:', email || username);

    if (!email) {
      console.log('Email is required');
      return res.status(400).json({ message: 'Email is required' });
    }

    const existingUserQuery = { email };
    if (username) {
      existingUserQuery.$or = [{ email }, { username }];
    }

    console.log('Checking for existing user with query:', JSON.stringify(existingUserQuery, null, 2));

    // Check if user exists across all collections
    const existingUser = await Promise.race([
      Customer.findOne(existingUserQuery),
      BusinessOwner.findOne(existingUserQuery),
      Manager.findOne(existingUserQuery),
      Support.findOne(existingUserQuery),
      Viewer.findOne(existingUserQuery),
      Admin.findOne(existingUserQuery)
    ]);
    
    if (existingUser) {
      console.log('User already exists');
      return res.status(400).json({ message: 'User already exists' });
    }

    console.log('Creating new customer...');
    // Default to creating a customer for new signups
    const newUser = await Customer.create({ 
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
          console.log('Signup successful, user authenticated');
    console.log('=== SIGNUP SUCCESS ===');
    
    res.status(201).json({
      message: 'User created successfully',
      token: token, // Send token in response for frontend localStorage
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
    console.log('🔍 DEBUG: === LOGIN ATTEMPT START ===');
    console.log('🔍 DEBUG: JWT_SECRET configuration: Configured');
    
    const { email, username, identifier, password } = req.body;
    console.log('🔍 DEBUG: Request body received:', { email, username, identifier, hasPassword: !!password, passwordLength: password ? password.length : 0 });
    
    // Handle identifier field (frontend sends this)
    const userEmail = email || identifier;
    const userUsername = username;
    console.log('🔍 DEBUG: Processed credentials:', { userEmail, userUsername });

    console.log('🔍 DEBUG: === LOGIN ATTEMPT ===');
    console.log('🔍 DEBUG: Login request received for:', userEmail || userUsername);

    // Require at least one of username or email
    if (!userEmail && !userUsername) {
      console.log('🔍 DEBUG: No username or email provided');
      return res.status(400).json({ message: 'Username or email is required' });
    }

    // Find user by email or username
    const query = {
      $or: [
        userEmail ? { email: userEmail } : {},
        userUsername ? { username: userUsername } : {}
      ].filter(condition => Object.keys(condition).length > 0) // Remove empty objects
    };
    console.log('🔍 DEBUG: Database query constructed:', JSON.stringify(query, null, 2));

    console.log('🔍 DEBUG: About to query database across all collections...');
    // Check for user across all collections with proper error handling
    let user = null;
    let userCollection = null;
    
    // Check Customer collection first (since it's working)
    try {
      console.log('🔍 DEBUG: Step 1 - Searching Customer collection...');
      user = await Customer.findOne(query).select('+password');
      if (user) {
        userCollection = 'Customer';
        console.log('✅ DEBUG: Step 1 SUCCESS - User found in Customer collection');
        console.log('🔍 DEBUG: Customer user details:', {
          id: user._id,
          email: user.email,
          username: user.username,
          role: user.role,
          hasPassword: !!user.password,
          passwordLength: user.password ? user.password.length : 0
        });
      } else {
        console.log('❌ DEBUG: Step 1 - No user found in Customer collection');
      }
    } catch (err) {
      console.log('❌ DEBUG: Step 1 ERROR - Error querying Customer collection:', err.message);
    }
    
    // Check other collections if Customer not found
    if (!user) {
      try {
        console.log('🔍 DEBUG: Step 2 - Searching BusinessOwner collection...');
        user = await BusinessOwner.findOne(query).select('+password');
        if (user) {
          userCollection = 'BusinessOwner';
          console.log('✅ DEBUG: Step 2 SUCCESS - User found in BusinessOwner collection');
        } else {
          console.log('❌ DEBUG: Step 2 - No user found in BusinessOwner collection');
        }
      } catch (err) {
        console.log('❌ DEBUG: Step 2 ERROR - Error querying BusinessOwner collection:', err.message);
      }
    }
    
    if (!user) {
      try {
        console.log('🔍 DEBUG: Step 3 - Searching Manager collection...');
        user = await Manager.findOne(query).select('+password');
        if (user) {
          userCollection = 'Manager';
          console.log('✅ DEBUG: Step 3 SUCCESS - User found in Manager collection');
        } else {
          console.log('❌ DEBUG: Step 3 - No user found in Manager collection');
        }
      } catch (err) {
        console.log('❌ DEBUG: Step 3 ERROR - Error querying Manager collection:', err.message);
      }
    }
    
    if (!user) {
      try {
        console.log('🔍 DEBUG: Step 4 - Searching Support collection...');
        user = await Support.findOne(query).select('+password');
        if (user) {
          userCollection = 'Support';
          console.log('✅ DEBUG: Step 4 SUCCESS - User found in Support collection');
        } else {
          console.log('❌ DEBUG: Step 4 - No user found in Support collection');
        }
      } catch (err) {
        console.log('❌ DEBUG: Step 4 ERROR - Error querying Support collection:', err.message);
      }
    }
    
    if (!user) {
      try {
        console.log('🔍 DEBUG: Step 5 - Searching Viewer collection...');
        user = await Viewer.findOne(query).select('+password');
        if (user) {
          userCollection = 'Viewer';
          console.log('✅ DEBUG: Step 5 SUCCESS - User found in Viewer collection');
        } else {
          console.log('❌ DEBUG: Step 5 - No user found in Viewer collection');
        }
      } catch (err) {
        console.log('❌ DEBUG: Step 5 ERROR - Error querying Viewer collection:', err.message);
      }
    }
    
    if (!user) {
      try {
        console.log('🔍 DEBUG: Step 6 - Searching Admin collection...');
        user = await Admin.findOne(query).select('+password');
        if (user) {
          userCollection = 'Admin';
          console.log('✅ DEBUG: Step 6 SUCCESS - User found in Admin collection');
        } else {
          console.log('❌ DEBUG: Step 6 - No user found in Admin collection');
        }
      } catch (err) {
        console.log('❌ DEBUG: Step 6 ERROR - Error querying Admin collection:', err.message);
      }
    }
    
    // Check Original Users collection as final fallback
    if (!user) {
      try {
        console.log('🔍 DEBUG: Step 7 - Checking Original Users collection as final fallback...');
        const UsersCollection = mongoose.connection.db.collection('users');
        user = await UsersCollection.findOne(query);
        if (user) {
          userCollection = 'OriginalUsers';
          console.log('✅ DEBUG: Step 7 SUCCESS - User found in Original Users collection');
          console.log('🔍 DEBUG: Original Users user details:', {
            id: user._id,
            email: user.email,
            username: user.username,
            role: user.role,
            isAdmin: user.isAdmin,
            hasPassword: !!user.password,
            passwordLength: user.password ? user.password.length : 0
          });
        } else {
          console.log('❌ DEBUG: Step 7 - No user found in Original Users collection');
        }
      } catch (err) {
        console.log('❌ DEBUG: Step 7 ERROR - Error querying Original Users collection:', err.message);
      }
    }
    console.log('🔍 DEBUG: === DATABASE SEARCH COMPLETED ===');
    console.log('🔍 DEBUG: Final search result - User found:', !!user);
    console.log('🔍 DEBUG: User collection determined:', userCollection);

    if (!user) {
      console.log('🔍 DEBUG: ❌ NO USER FOUND - Login attempt failed');
      return res.status(401).json({ message: 'Invalid credentials' }); 
    }

    console.log('🔍 DEBUG: === USER VALIDATION START ===');
    console.log('🔍 DEBUG: User found in collection:', userCollection);
    console.log('🔍 DEBUG: User object type:', typeof user);
    console.log('🔍 DEBUG: User constructor name:', user.constructor.name);
    console.log('🔍 DEBUG: User has comparePassword method:', typeof user.comparePassword === 'function');
    console.log('🔍 DEBUG: Final user object details:', {
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      isAdmin: user.isAdmin,
      hasPassword: !!user.password,
      passwordLength: user.password ? user.password.length : 0,
      passwordStartsWith: user.password ? user.password.substring(0, 7) : 'none'
    });

    console.log('🔍 DEBUG: === PASSWORD VERIFICATION START ===');
    console.log('🔍 DEBUG: About to verify password for user from collection:', userCollection);
    
    // Handle password verification based on collection type
    let passwordMatch = false;
    
    if (userCollection === 'OriginalUsers') {
      // For original users collection, use bcrypt directly
      console.log('🔍 DEBUG: 🔐 Processing OriginalUsers - using bcrypt.compare() directly');
      const bcrypt = require('bcryptjs');
      console.log('🔍 DEBUG: Input password length:', password.length);
      console.log('🔍 DEBUG: Stored password hash:', user.password);
      passwordMatch = await bcrypt.compare(password, user.password);
      console.log('🔍 DEBUG: ✅ OriginalUsers password verification result:', passwordMatch);
    } else {
      // For new schema users, get proper model instance and use comparePassword method
      console.log('🔍 DEBUG: 🔐 Processing new schema user - getting model instance for:', userCollection);
      let userModel = user;
      
      if (userCollection === 'Customer') {
        console.log('🔍 DEBUG: Getting Customer model instance...');
        userModel = await Customer.findById(user._id).select('+password');
      } else if (userCollection === 'BusinessOwner') {
        console.log('🔍 DEBUG: Getting BusinessOwner model instance...');
        userModel = await BusinessOwner.findById(user._id).select('+password');
      } else if (userCollection === 'Manager') {
        console.log('🔍 DEBUG: Getting Manager model instance...');
        userModel = await Manager.findById(user._id).select('+password');
      } else if (userCollection === 'Support') {
        console.log('🔍 DEBUG: Getting Support model instance...');
        userModel = await Support.findById(user._id).select('+password');
      } else if (userCollection === 'Viewer') {
        console.log('🔍 DEBUG: Getting Viewer model instance...');
        userModel = await Viewer.findById(user._id).select('+password');
      } else if (userCollection === 'Admin') {
        console.log('🔍 DEBUG: Getting Admin model instance...');
        userModel = await Admin.findById(user._id).select('+password');
      }
      
      console.log('🔍 DEBUG: Model instance obtained, testing comparePassword method...');
      console.log('🔍 DEBUG: UserModel has comparePassword method:', typeof userModel.comparePassword === 'function');
      passwordMatch = await userModel.comparePassword(password);
      console.log('🔍 DEBUG: ✅ New schema password verification result:', passwordMatch);
    }
    
    // Security: Don't log password details
    console.log('🔍 DEBUG: === PASSWORD VERIFICATION RESULT ===');
    console.log('🔍 DEBUG: Final password verification result:', passwordMatch);
    
    if (!passwordMatch) {
      console.log('🔍 DEBUG: ❌ PASSWORD VERIFICATION FAILED - Login denied');
      return res.status(401).json({ message: 'Invalid credentials' }); 
    }

    console.log('🔍 DEBUG: ✅ PASSWORD VERIFICATION SUCCESSFUL - Proceeding to token generation');
    console.log('🔍 DEBUG: === TOKEN GENERATION START ===');
    console.log('🔍 DEBUG: Generating JWT token for user ID:', user._id);
    
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );
    console.log('🔍 DEBUG: ✅ JWT token generated successfully');
    console.log('🔍 DEBUG: Token payload:', { id: user._id, expiresIn: '1d' });

    console.log('🔍 DEBUG: === COOKIE SETTING START ===');
    console.log('🔍 DEBUG: About to set JWT cookie with options:', cookieOptions);
    res.cookie('jwt', token, cookieOptions);
    console.log('🔍 DEBUG: ✅ JWT cookie set successfully');
    
    console.log('🔍 DEBUG: === LOGIN SUCCESS ===');
    console.log('🔍 DEBUG: Login successful for user ID:', user._id);
    console.log('🔍 DEBUG: User collection type:', userCollection);
    
    // Prepare user data for response based on collection type
    console.log('🔍 DEBUG: === RESPONSE PREPARATION START ===');
    let userData;
    if (userCollection === 'OriginalUsers') {
      // For original users, create a clean user object
      console.log('🔍 DEBUG: Preparing OriginalUsers response data...');
      userData = {
        _id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isAdmin: user.isAdmin,
        isActive: user.isActive,
        permissions: user.permissions || [],
        adminNotes: user.adminNotes,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
      console.log('🔍 DEBUG: OriginalUsers response data prepared:', userData);
    } else {
      // For new schema users, use toJSON method
      console.log('🔍 DEBUG: Preparing new schema response data using toJSON()...');
      userData = user.toJSON();
      console.log('🔍 DEBUG: New schema response data prepared:', userData);
    }
    
    console.log('🔍 DEBUG: === SENDING RESPONSE ===');
    console.log('🔍 DEBUG: Final response data:', {
      message: 'Login successful',
      userId: userData._id,
      userRole: userData.role,
      userCollection: userCollection,
      hasToken: !!token
    });
    
    res.json({
      message: 'Login successful',
      user: userData,
      token: token // Send token in response for frontend localStorage
    });
    
    console.log('🔍 DEBUG: ✅ LOGIN PROCESS COMPLETED SUCCESSFULLY');
    console.log('🔍 DEBUG: === END LOGIN FUNCTION ===');

  } catch (error) {
    console.error('🔍 DEBUG: ❌ LOGIN ERROR OCCURRED ===');
    console.error('🔍 DEBUG: Error type:', error.constructor.name);
    console.error('🔍 DEBUG: Error message:', error.message);
    console.error('🔍 DEBUG: Error stack:', error.stack);
    console.error('🔍 DEBUG: === END ERROR LOG ===');
    
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

    // Check for user across all collections
    let user = await Customer.findOne({ email });
    if (!user) {
      user = await BusinessOwner.findOne({ email });
    }
    if (!user) {
      user = await Manager.findOne({ email });
    }
    if (!user) {
      user = await Support.findOne({ email });
    }
    if (!user) {
      user = await Viewer.findOne({ email });
    }
    if (!user) {
      user = await Admin.findOne({ email });
    }
    
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

    // Find user across all collections
    let user = await Customer.findById(tokenData.userId);
    if (!user) {
      user = await BusinessOwner.findById(tokenData.userId);
    }
    if (!user) {
      user = await Manager.findById(tokenData.userId);
    }
    if (!user) {
      user = await Support.findById(tokenData.userId);
    }
    if (!user) {
      user = await Viewer.findById(tokenData.userId);
    }
    if (!user) {
      user = await Admin.findById(tokenData.userId);
    }
    
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