const BusinessOwner = require('../models/businessOwners');
const jwt = require('jsonwebtoken');

// Generate JWT token for business owner
const generateBusinessOwnerToken = (businessOwner) => {
  return jwt.sign(
    { 
      id: businessOwner._id, 
      email: businessOwner.email,
      businessName: businessOwner.businessName,
      accessLevel: businessOwner.accessLevel,
      isSuperAdmin: businessOwner.isSuperAdmin
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Business Owner Registration
const registerBusinessOwner = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      businessName,
      businessLLC,
      businessType,
      businessIndustry,
      businessDescription,
      businessAddress,
      username,
      password
    } = req.body;

    // Check if business owner already exists
    const existingBusinessOwner = await BusinessOwner.findOne({
      $or: [{ email }, { username }]
    });

    if (existingBusinessOwner) {
      return res.status(400).json({
        message: 'Business owner with this email or username already exists'
      });
    }

    // Create new business owner
    const businessOwner = new BusinessOwner({
      firstName,
      lastName,
      email,
      phoneNumber,
      businessName,
      businessLLC,
      businessType,
      businessIndustry,
      businessDescription,
      businessAddress,
      username,
      password,
      storefrontUrl: `${username.toLowerCase()}.diviaswickshop.com`
    });

    await businessOwner.save();

    // Generate token
    const token = generateBusinessOwnerToken(businessOwner);

    // Set HTTP-only cookie
    res.cookie('businessOwnerToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      message: 'Business owner registered successfully',
      businessOwner: businessOwner.getSummary(),
      token
    });

  } catch (error) {
    console.error('Business owner registration error:', error);
    res.status(500).json({
      message: 'Business owner registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Business Owner Login
const loginBusinessOwner = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Find business owner by email or username
    const businessOwner = await BusinessOwner.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    }).select('+password');

    if (!businessOwner) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    // Check if business owner is active
    if (!businessOwner.isActive || businessOwner.status === 'suspended') {
      return res.status(401).json({
        message: 'Account is suspended or inactive'
      });
    }

    // Verify password
    const isPasswordValid = await businessOwner.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateBusinessOwnerToken(businessOwner);

    // Set HTTP-only cookie
    res.cookie('businessOwnerToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      message: 'Business owner login successful',
      businessOwner: businessOwner.getSummary(),
      token
    });

  } catch (error) {
    console.error('Business owner login error:', error);
    res.status(500).json({
      message: 'Business owner login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Business Owner Logout
const logoutBusinessOwner = async (req, res) => {
  try {
    res.clearCookie('businessOwnerToken');
    res.json({
      message: 'Business owner logged out successfully'
    });
  } catch (error) {
    console.error('Business owner logout error:', error);
    res.status(500).json({
      message: 'Business owner logout failed'
    });
  }
};

// Get Business Owner Profile
const getBusinessOwnerProfile = async (req, res) => {
  try {
    const businessOwner = await BusinessOwner.findById(req.businessOwner.id);
    
    if (!businessOwner) {
      return res.status(404).json({
        message: 'Business owner not found'
      });
    }

    res.json({
      businessOwner: businessOwner.getSummary()
    });

  } catch (error) {
    console.error('Get business owner profile error:', error);
    res.status(500).json({
      message: 'Failed to get business owner profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update Business Owner Profile
const updateBusinessOwnerProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phoneNumber,
      businessName,
      businessLLC,
      businessType,
      businessIndustry,
      businessDescription,
      businessAddress,
      preferences
    } = req.body;

    const businessOwner = await BusinessOwner.findById(req.businessOwner.id);
    
    if (!businessOwner) {
      return res.status(404).json({
        message: 'Business owner not found'
      });
    }

    // Update fields
    if (firstName) businessOwner.firstName = firstName;
    if (lastName) businessOwner.lastName = lastName;
    if (phoneNumber) businessOwner.phoneNumber = phoneNumber;
    if (businessName) businessOwner.businessName = businessName;
    if (businessLLC) businessOwner.businessLLC = businessLLC;
    if (businessType) businessOwner.businessType = businessType;
    if (businessIndustry) businessOwner.businessIndustry = businessIndustry;
    if (businessDescription) businessOwner.businessDescription = businessDescription;
    if (businessAddress) businessOwner.businessAddress = businessAddress;
    if (preferences) businessOwner.preferences = { ...businessOwner.preferences, ...preferences };

    await businessOwner.save();

    res.json({
      message: 'Business owner profile updated successfully',
      businessOwner: businessOwner.getSummary()
    });

  } catch (error) {
    console.error('Update business owner profile error:', error);
    res.status(500).json({
      message: 'Failed to update business owner profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get All Business Owners (Admin only)
const getAllBusinessOwners = async (req, res) => {
  try {
    const businessOwners = await BusinessOwner.find({})
      .select('firstName lastName email businessName businessLLC subscriptionStatus subscriptionPlan status createdAt')
      .sort({ createdAt: -1 });

    res.json({
      businessOwners,
      total: businessOwners.length
    });

  } catch (error) {
    console.error('Get all business owners error:', error);
    res.status(500).json({
      message: 'Failed to get business owners',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get Business Owner by ID (Admin only)
const getBusinessOwnerById = async (req, res) => {
  try {
    const businessOwner = await BusinessOwner.findById(req.params.id);
    
    if (!businessOwner) {
      return res.status(404).json({
        message: 'Business owner not found'
      });
    }

    res.json({
      businessOwner
    });

  } catch (error) {
    console.error('Get business owner by ID error:', error);
    res.status(500).json({
      message: 'Failed to get business owner',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update Business Owner Status (Admin only)
const updateBusinessOwnerStatus = async (req, res) => {
  try {
    const { status, suspensionReason, adminNotes } = req.body;

    const businessOwner = await BusinessOwner.findById(req.params.id);
    
    if (!businessOwner) {
      return res.status(404).json({
        message: 'Business owner not found'
      });
    }

    if (status) businessOwner.status = status;
    if (suspensionReason) businessOwner.suspensionReason = suspensionReason;
    if (adminNotes) businessOwner.adminNotes = adminNotes;

    if (status === 'suspended') {
      businessOwner.suspensionDate = new Date();
      businessOwner.isActive = false;
    } else if (status === 'active') {
      businessOwner.suspensionDate = null;
      businessOwner.isActive = true;
    }

    await businessOwner.save();

    res.json({
      message: 'Business owner status updated successfully',
      businessOwner: businessOwner.getSummary()
    });

  } catch (error) {
    console.error('Update business owner status error:', error);
    res.status(500).json({
      message: 'Failed to update business owner status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get Business Owner Dashboard Stats
const getBusinessOwnerStats = async (req, res) => {
  try {
    const businessOwner = await BusinessOwner.findById(req.businessOwner.id);
    
    if (!businessOwner) {
      return res.status(404).json({
        message: 'Business owner not found'
      });
    }

    // Calculate stats
    const stats = {
      subscriptionStatus: businessOwner.subscriptionStatus,
      subscriptionPlan: businessOwner.subscriptionPlan,
      daysUntilPayment: businessOwner.daysUntilPayment,
      isSubscriptionActive: businessOwner.isSubscriptionActive,
      productLimit: businessOwner.productLimit,
      orderLimit: businessOwner.orderLimit,
      storageLimit: businessOwner.storageLimit,
      unreadNotifications: businessOwner.notifications.filter(n => !n.read).length,
      supportTickets: businessOwner.supportTickets.filter(t => t.status !== 'closed').length
    };

    res.json({
      stats
    });

  } catch (error) {
    console.error('Get business owner stats error:', error);
    res.status(500).json({
      message: 'Failed to get business owner stats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  registerBusinessOwner,
  loginBusinessOwner,
  logoutBusinessOwner,
  getBusinessOwnerProfile,
  updateBusinessOwnerProfile,
  getAllBusinessOwners,
  getBusinessOwnerById,
  updateBusinessOwnerStatus,
  getBusinessOwnerStats
}; 