const Product = require('../models/products');
const Category = require('../models/categories');
const Order = require('../models/order');
const User = require('../models/users');
const jwt = require('jsonwebtoken');

// Admin middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  // Check if user is admin (either role is admin or isAdmin flag is true)
  if (req.user.role !== 'admin' && !req.user.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  next();
};

// Admin login for corporate portal
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('\n🔐 ADMIN LOGIN ATTEMPT:');
    console.log('Email:', email);
    console.log('Password provided:', !!password);
    
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials', code: 'USER_NOT_FOUND' });
    }

    const permissions = user.adminProfile?.permissions || user.permissions || [];
    const hasAdminAccess = user.role === 'admin' || user.isAdmin === true ||
      (permissions && permissions.some(p => p.resource === 'admin_management'));

    if (!hasAdminAccess) {
      return res.status(403).json({
        message: 'Admin access required. Ask an admin to run: node scripts/make-admin.js <your-email>',
        code: 'NOT_ADMIN'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated', code: 'DEACTIVATED' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials', code: 'WRONG_PASSWORD' });
    }

    user.lastLogin = new Date();
    await user.save();

    const adminLevel = user.adminProfile?.adminLevel || (user.role === 'admin' && user.isAdmin ? 'super_admin' : 'admin');
    const adminToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        username: user.username,
        role: 'admin',
        isAdmin: true,
        adminLevel,
        permissions
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const adminData = {
      _id: user._id,
      email: user.email,
      username: user.username,
      role: 'admin',
      isAdmin: true,
      adminLevel,
      permissions,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      lastLogin: user.lastLogin
    };

    res.json({
      message: 'Admin login successful',
      admin: adminData,
      token: adminToken
    });
  } catch (error) {
    console.error('❌ Admin login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

// Get admin dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    console.log('🔍 Dashboard stats request from user:', req.user._id);
    console.log('🔍 User role:', req.user.role);
    console.log('🔍 User isAdmin:', req.user.isAdmin);
    console.log('🔍 User permissions:', req.user.permissions);
    
    // Check if user is Super Admin
    // Primary: Has admin_management permissions
    // Fallback: Has role 'admin' and isAdmin: true (for existing admin users)
    let isSuperAdmin = false;
    
    // First check: Does user have explicit admin_management permissions?
    if (req.user.permissions && req.user.permissions.length > 0) {
      isSuperAdmin = req.user.permissions.some(p => 
        p.resource === 'admin_management' && p.actions.includes('read')
      );
    }
    
    // Second check: If no explicit permissions, check role and isAdmin flag
    if (!isSuperAdmin && req.user.role === 'admin' && req.user.isAdmin === true) {
      isSuperAdmin = true;
      console.log('🔑 User has admin role and isAdmin flag - automatically granting Super Admin access');
      
      // Auto-setup permissions for existing admin users
      if (!req.user.permissions || req.user.permissions.length === 0) {
        console.log('🔧 Setting up default permissions for existing admin user');
        
        // Set up default Super Admin permissions
        const defaultPermissions = [
          { resource: 'products', actions: ['read', 'create', 'update', 'delete'] },
          { resource: 'categories', actions: ['read', 'create', 'update', 'delete'] },
          { resource: 'orders', actions: ['read', 'create', 'update', 'delete'] },
          { resource: 'users', actions: ['read', 'create', 'update', 'delete'] },
          { resource: 'analytics', actions: ['read'] },
          { resource: 'settings', actions: ['read', 'update'] },
          { resource: 'admin_management', actions: ['read', 'create', 'update', 'delete'] }
        ];
        
        // Update user permissions in database
        try {
          await User.findByIdAndUpdate(req.user._id, { 'adminProfile.permissions': defaultPermissions });
          console.log('✅ Updated user permissions in database');
        } catch (error) {
          console.log('⚠️ Could not update user permissions:', error.message);
        }
      }
    }
    
    console.log('🔍 Final isSuperAdmin check:', isSuperAdmin);
    console.log('🔍 User role:', req.user.role);
    console.log('🔍 User isAdmin:', req.user.isAdmin);
    console.log('🔍 User permissions count:', req.user.permissions ? req.user.permissions.length : 0);
    
    console.log('🔍 Is Super Admin:', isSuperAdmin);
    
    if (isSuperAdmin) {
      console.log('👑 Processing Super Admin dashboard...');
      
      // Super Admin - Platform-wide statistics
      let totalProducts = 0, totalOrders = 0, totalUsers = 0, totalBusinesses = 0, totalAdmins = 0;
      let platformRevenue = 0, recentOrders = [], lowStockProducts = [];
      
      try {
        totalProducts = await Product.countDocuments();
        totalOrders = await Order.countDocuments();
        
        // Count users from all role-based collections
        const customerCount = await User.countDocuments({ role: 'customer' });
        const businessOwnerCount = await User.countDocuments({ role: 'business_owner' });
        const managerCount = await User.countDocuments({ role: 'manager' });
        const supportCount = await User.countDocuments({ role: 'support' });
        const viewerCount = await User.countDocuments({ role: 'viewer' });
        const adminCount = await User.countDocuments({ $or: [{ role: 'admin' }, { isAdmin: true }] });
        
        totalUsers = customerCount + businessOwnerCount + managerCount + supportCount + viewerCount + adminCount;
        totalBusinesses = businessOwnerCount;
        totalAdmins = adminCount;
        
        console.log('📊 Counts:', { totalProducts, totalOrders, totalUsers, totalBusinesses, totalAdmins });
        
        // Calculate platform revenue
        const orders = await Order.find({ status: 'completed' });
        platformRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
        
        console.log('💰 Platform revenue:', platformRevenue);
        
        // Get recent platform orders
        recentOrders = await Order.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('user', 'username email');
        
        // Get low stock products across platform
        lowStockProducts = await Product.find({ stock: { $lt: 10 } })
          .select('name stock price')
          .limit(5);
          
      } catch (error) {
        console.log('⚠️ Error fetching some data:', error.message);
        // Continue with default values
      }
      
      const responseData = {
        stats: {
          totalProducts,
          totalOrders,
          platformUsers: totalUsers,
          totalBusinesses,
          totalAdmins,
          platformRevenue: platformRevenue.toFixed(2)
        },
        recentOrders,
        lowStockProducts
      };
      
      console.log('📊 Sending Super Admin stats:', responseData);
      res.json(responseData);
    } else {
      console.log('🏢 Processing Business Owner Admin dashboard...');
      
      // Business Owner Admin - Business-specific statistics
      let totalProducts = 0, totalOrders = 0, totalUsers = 0, totalRevenue = 0;
      let recentOrders = [], lowStockProducts = [];
      
      try {
        totalProducts = await Product.countDocuments();
        totalOrders = await Order.countDocuments();
        totalUsers = await User.countDocuments();
        
        console.log('📊 Business counts:', { totalProducts, totalOrders, totalUsers });
        
        // Calculate business revenue
        const orders = await Order.find({ status: 'completed' });
        totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
        
        console.log('💰 Business revenue:', totalRevenue);
        
        // Get recent business orders
        recentOrders = await Order.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('user', 'username email');
        
        // Get low stock products for business
        lowStockProducts = await Product.find({ stock: { $lt: 10 } })
          .select('name stock price')
          .limit(5);
          
      } catch (error) {
        console.log('⚠️ Error fetching business data:', error.message);
        // Continue with default values
      }
      
      const responseData = {
        stats: {
          totalProducts,
          totalOrders,
          totalUsers,
          totalRevenue: totalRevenue.toFixed(2)
        },
        recentOrders,
        lowStockProducts
      };
      
      console.log('📊 Sending Business Owner Admin stats:', responseData);
      res.json(responseData);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
  }
};

// Get all products for admin
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('category');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

// Add new product
const addProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, featured } = req.body;
    
    const newProduct = new Product({
      name,
      description,
      price: parseFloat(price),
      category,
      stock: parseInt(stock) || 0,
      featured: featured || false,
      image: req.file ? req.file.path : null // If you have file upload middleware
    });
    
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error adding product', error: error.message });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Handle file upload if present
    if (req.file) {
      updates.image = req.file.path;
    }
    
    const updatedProduct = await Product.findByIdAndUpdate(
      id, 
      updates, 
      { new: true }
    ).populate('category');
    
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
};

// Get all categories for admin
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};

// Add new category
const addCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const newCategory = new Category({
      name,
      description
    });
    
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ message: 'Error adding category', error: error.message });
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updatedCategory = await Category.findByIdAndUpdate(
      id, 
      updates, 
      { new: true }
    );
    
    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: 'Error updating category', error: error.message });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if category is being used by any products
    const productsUsingCategory = await Product.find({ category: id });
    if (productsUsingCategory.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category that has products. Please reassign or delete products first.' 
      });
    }
    
    const deletedCategory = await Category.findByIdAndDelete(id);
    
    if (!deletedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
};

// Get all orders for admin
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'username email')
      .populate('items.product', 'name price image')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('user', 'username email');
    
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status', error: error.message });
  }
};

// Get all users for admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    const allUsers = users.map(user => ({ ...user.toObject(), userType: user.role || 'customer' }));
    res.json(allUsers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    const validRoles = ['customer', 'business_owner', 'admin', 'manager', 'support', 'viewer'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        message: `Invalid role: ${role}. Valid roles are: ${validRoles.join(', ')}` 
      });
    }
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const updateData = { role };
    if (role === 'admin') {
      updateData.isAdmin = true;
    }
    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user role', error: error.message });
  }
};

// Update user business information
const updateUserBusinessInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const { businessInfo } = req.body;
    if (!businessInfo || typeof businessInfo !== 'object') {
      return res.status(400).json({ message: 'Invalid business information' });
    }
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: { 'businessOwnerProfile.businessInfo': businessInfo } },
      { new: true }
    ).select('-password');
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user business information', error: error.message });
  }
};

// Update user email (Super Admin only)
const updateUserEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    
    // Validate email format
    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    // Check if new email is already taken by another user across all collections
    const existingUser = await User.findOne({ email: email.toLowerCase(), _id: { $ne: id } });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already taken by another user' });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { email: email.toLowerCase() },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user email', error: error.message });
  }
};

// Update user status (Super Admin only)
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    // Validate isActive is a boolean
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'isActive must be a boolean value' });
    }
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role === 'admin' && user.isAdmin === true && !isActive) {
      return res.status(403).json({ message: 'Cannot deactivate super admin users. Contact another super admin if needed.' });
    }
    const updatedUser = await User.findByIdAndUpdate(id, { isActive }, { new: true }).select('-password');
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user status', error: error.message });
  }
};

// Remove user (Super Admin only)
const removeUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role === 'admin' && user.isAdmin === true) {
      return res.status(403).json({ message: 'Cannot remove super admin users. Contact another super admin if needed.' });
    }
    const superAdminCount = await User.countDocuments({ $or: [{ role: 'admin' }, { isAdmin: true }] });
    if (superAdminCount <= 1) {
      return res.status(400).json({ message: 'Cannot remove the last super admin. At least one super admin must remain.' });
    }
    await User.findByIdAndDelete(id);
    res.json({ message: 'User removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing user', error: error.message });
  }
};

// Admin Management Functions

// Invite new admin
const inviteAdmin = async (req, res) => {
  try {
    const { email, role, permissions, firstName, lastName, businessInfo } = req.body;
    
    console.log('Invite admin request:', { email, role, permissions, firstName, lastName });
    
    // SECURITY: Never allow super admin role to be invited
    if (role === 'super_admin') {
      return res.status(403).json({ message: 'Super admin role cannot be invited for security reasons' });
    }
    
    // Check if user already exists across all collections
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Set default permissions based on role if none provided
    let finalPermissions = permissions;
    if (!permissions || permissions.length === 0) {
      switch (role) {
        case 'admin':
          finalPermissions = [
            { resource: 'products', actions: ['read', 'create', 'update', 'delete'] },
            { resource: 'categories', actions: ['read', 'create', 'update', 'delete'] },
            { resource: 'orders', actions: ['read', 'update'] },
            { resource: 'users', actions: ['read', 'update'] },
            { resource: 'analytics', actions: ['read'] },
            { resource: 'settings', actions: ['read', 'update'] }
          ];
          break;
        case 'business_owner':
          finalPermissions = [
            { resource: 'products', actions: ['read', 'create', 'update', 'delete'] },
            { resource: 'categories', actions: ['read', 'create', 'update', 'delete'] },
            { resource: 'orders', actions: ['read', 'update'] },
            { resource: 'customers', actions: ['read', 'update'] },
            { resource: 'analytics', actions: ['read'] },
            { resource: 'settings', actions: ['read', 'update'] },
            { resource: 'team_management', actions: ['read', 'create', 'update'] }
          ];
          break;
        case 'manager':
          finalPermissions = [
            { resource: 'products', actions: ['read', 'create', 'update'] },
            { resource: 'categories', actions: ['read', 'create', 'update'] },
            { resource: 'orders', actions: ['read', 'update'] },
            { resource: 'users', actions: ['read'] },
            { resource: 'analytics', actions: ['read'] }
          ];
          break;
        case 'support':
          finalPermissions = [
            { resource: 'orders', actions: ['read', 'update'] },
            { resource: 'users', actions: ['read', 'update'] },
            { resource: 'analytics', actions: ['read'] }
          ];
          break;
        case 'viewer':
          finalPermissions = [
            { resource: 'products', actions: ['read'] },
            { resource: 'orders', actions: ['read'] },
            { resource: 'analytics', actions: ['read'] }
          ];
          break;
        default:
          finalPermissions = [];
      }
    }

    console.log('Final permissions:', finalPermissions);

    // Create admin invitation
    const AdminInvite = require('../models/adminInvite');
    const invite = new AdminInvite({
      email,
      firstName,
      lastName,
      role,
      permissions: finalPermissions,
      businessInfo: businessInfo || {},
      invitedBy: req.user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    console.log('Created invite object:', invite);

    // Save the invite and check for token generation
    await invite.save();
    console.log('Invite saved successfully');
    console.log('Generated token:', invite.token ? 'Present' : 'Missing');
    console.log('Final invite object:', invite.toObject());

    // TODO: Send email invitation
    // await sendAdminInviteEmail(invite);

    res.status(201).json({ 
      message: 'Admin invitation sent successfully',
      invite: {
        id: invite._id,
        email: invite.email,
        firstName: invite.firstName,
        lastName: invite.lastName,
        role: invite.role,
        businessInfo: invite.businessInfo,
        expiresAt: invite.expiresAt
      }
    });
  } catch (error) {
    console.error('Error in inviteAdmin:', error);
    res.status(500).json({ message: 'Error sending admin invitation', error: error.message });
  }
};

// Update user permissions
const updateUserPermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;
    
    // Find user in any collection and update permissions
    let updatedUser = await User.findByIdAndUpdate(
      id,
      { permissions },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      updatedUser = await User.findByIdAndUpdate(
        id,
        { permissions },
        { new: true }
      ).select('-password');
    }
    
    if (!updatedUser) {
      updatedUser = await User.findByIdAndUpdate(
        id,
        { permissions },
        { new: true }
      ).select('-password');
    }
    
    if (!updatedUser) {
      updatedUser = await User.findByIdAndUpdate(
        id,
        { permissions },
        { new: true }
      ).select('-password');
    }
    
    if (!updatedUser) {
      updatedUser = await User.findByIdAndUpdate(
        id,
        { permissions },
        { new: true }
      ).select('-password');
    }
    
    if (!updatedUser) {
      updatedUser = await User.findByIdAndUpdate(
        id,
        { permissions },
        { new: true }
      ).select('-password');
    }
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user permissions', error: error.message });
  }
};

// Remove admin role
const removeAdminRole = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find user in any collection and remove admin role
    let updatedUser = await User.findByIdAndUpdate(
      id,
      { 
        role: 'customer',
        isAdmin: false,
        permissions: [],
        adminNotes: 'Admin role removed'
      },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      updatedUser = await User.findByIdAndUpdate(
        id,
        { 
          role: 'business_owner',
          isAdmin: false,
          permissions: [],
          adminNotes: 'Admin role removed'
        },
        { new: true }
      ).select('-password');
    }
    
    if (!updatedUser) {
      updatedUser = await User.findByIdAndUpdate(
        id,
        { 
          role: 'manager',
          isAdmin: false,
          permissions: [],
          adminNotes: 'Admin role removed'
        },
        { new: true }
      ).select('-password');
    }
    
    if (!updatedUser) {
      updatedUser = await User.findByIdAndUpdate(
        id,
        { 
          role: 'support',
          isAdmin: false,
          permissions: [],
          adminNotes: 'Admin role removed'
        },
        { new: true }
      ).select('-password');
    }
    
    if (!updatedUser) {
      updatedUser = await User.findByIdAndUpdate(
        id,
        { 
          role: 'viewer',
          isAdmin: false,
          permissions: [],
          adminNotes: 'Admin role removed'
        },
        { new: true }
      ).select('-password');
    }
    
    if (!updatedUser) {
      updatedUser = await User.findByIdAndUpdate(
        id,
        { 
          role: 'customer',
          isAdmin: false,
          permissions: [],
          adminNotes: 'Admin role removed'
        },
        { new: true }
      ).select('-password');
    }
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'Admin role removed successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Error removing admin role', error: error.message });
  }
};

// Get admin invitations
const getAdminInvites = async (req, res) => {
  try {
    const AdminInvite = require('../models/adminInvite');
    const invites = await AdminInvite.find()
      .populate('invitedBy', 'username email')
      .sort({ createdAt: -1 });
    
    res.json(invites);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin invitations', error: error.message });
  }
};

// Cancel admin invitation
const cancelAdminInvite = async (req, res) => {
  try {
    const { id } = req.params;
    
    const AdminInvite = require('../models/adminInvite');
    const invite = await AdminInvite.findByIdAndDelete(id);
    
    if (!invite) {
      return res.status(404).json({ message: 'Invitation not found' });
    }
    
    res.json({ message: 'Invitation cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling invitation', error: error.message });
  }
};

// Get all admin users
const getAllAdmins = async (req, res) => {
  try {
    // Get admins from Admin collection
    const adminUsers = await User.find({ 
      $or: [{ role: 'admin' }, { isAdmin: true }] 
    }).select('-password').sort({ createdAt: -1 });

    const allAdmins = adminUsers.map(admin => ({ ...admin.toObject(), collection: admin.role || 'admin' }));
    res.json(allAdmins);
  } catch (error) {
    console.error('Error getting all admins:', error);
    res.status(500).json({ message: 'Error fetching admins', error: error.message });
  }
};

// Get admin details
const getAdminDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const admin = await User.findById(id).select('-password');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    const adminData = { ...admin.toObject(), collection: admin.role };
    res.json(adminData);
  } catch (error) {
    console.error('Error getting admin details:', error);
    res.status(500).json({ message: 'Error fetching admin details', error: error.message });
  }
};

// Update admin user
const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Remove sensitive fields
    delete updateData.password;
    delete updateData.email; // Don't allow email changes via this endpoint
    
    // Search and update in Admin collection first
    let updatedAdmin = await User.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true }
    ).select('-password');
    
    if (!updatedAdmin) {
      // Try Customer collection
      updatedAdmin = await User.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true }
      ).select('-password');
    }
    
    if (!updatedAdmin) {
      // Try BusinessOwner collection
      updatedAdmin = await User.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true }
      ).select('-password');
    }
    
    if (!updatedAdmin) {
      // Try Manager collection
      updatedAdmin = await User.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true }
      ).select('-password');
    }
    
    if (!updatedAdmin) {
      // Try Support collection
      updatedAdmin = await User.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true }
      ).select('-password');
    }
    
    if (!updatedAdmin) {
      // Try Viewer collection
      updatedAdmin = await User.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true }
      ).select('-password');
    }
    
    if (!updatedAdmin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    res.json({ message: 'Admin updated successfully', admin: updatedAdmin });
  } catch (error) {
    console.error('Error updating admin:', error);
    res.status(500).json({ message: 'Error updating admin', error: error.message });
  }
};

// Delete admin user
const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if trying to delete a super admin
    let admin = await User.findById(id);
    if (admin && admin.isAdmin === true) {
      return res.status(403).json({ message: 'Cannot delete super admin users' });
    }
    
    // Try to delete from Admin collection first
    let deletedAdmin = await User.findByIdAndDelete(id);
    
    if (!deletedAdmin) {
      // Try Customer collection
      deletedAdmin = await User.findByIdAndDelete(id);
    }
    
    if (!deletedAdmin) {
      // Try BusinessOwner collection
      deletedAdmin = await User.findByIdAndDelete(id);
    }
    
    if (!deletedAdmin) {
      // Try Manager collection
      deletedAdmin = await User.findByIdAndDelete(id);
    }
    
    if (!deletedAdmin) {
      // Try Support collection
      deletedAdmin = await User.findByIdAndDelete(id);
    }
    
    if (!deletedAdmin) {
      // Try Viewer collection
      deletedAdmin = await User.findByIdAndDelete(id);
    }
    
    if (!deletedAdmin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    res.json({ message: 'Admin deleted successfully', admin: deletedAdmin });
  } catch (error) {
    console.error('Error deleting admin:', error);
    res.status(500).json({ message: 'Error deleting admin', error: error.message });
  }
};

// Update admin status
const updateAdminStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    // Update in Admin collection first
    let updatedAdmin = await User.findByIdAndUpdate(
      id, 
      { isActive }, 
      { new: true }
    ).select('-password');
    
    if (!updatedAdmin) {
      // Try Customer collection
      updatedAdmin = await User.findByIdAndUpdate(
        id, 
        { isActive }, 
        { new: true }
      ).select('-password');
    }
    
    if (!updatedAdmin) {
      // Try BusinessOwner collection
      updatedAdmin = await User.findByIdAndUpdate(
        id, 
        { isActive }, 
        { new: true }
      ).select('-password');
    }
    
    if (!updatedAdmin) {
      // Try Manager collection
      updatedAdmin = await User.findByIdAndUpdate(
        id, 
        { isActive }, 
        { new: true }
      ).select('-password');
    }
    
    if (!updatedAdmin) {
      // Try Support collection
      updatedAdmin = await User.findByIdAndUpdate(
        id, 
        { isActive }, 
        { new: true }
      ).select('-password');
    }
    
    if (!updatedAdmin) {
      // Try Viewer collection
      updatedAdmin = await User.findByIdAndUpdate(
        id, 
        { isActive }, 
        { new: true }
      ).select('-password');
    }
    
    if (!updatedAdmin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    res.json({ message: 'Admin status updated successfully', admin: updatedAdmin });
  } catch (error) {
    console.error('Error updating admin status:', error);
    res.status(500).json({ message: 'Error updating admin status', error: error.message });
  }
};

// Update admin permissions
const updateAdminPermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;
    
    // Update in Admin collection first
    let updatedAdmin = await User.findByIdAndUpdate(
      id, 
      { permissions }, 
      { new: true }
    ).select('-password');
    
    if (!updatedAdmin) {
      // Try Customer collection
      updatedAdmin = await User.findByIdAndUpdate(
        id, 
        { permissions }, 
        { new: true }
      ).select('-password');
    }
    
    if (!updatedAdmin) {
      // Try BusinessOwner collection
      updatedAdmin = await User.findByIdAndUpdate(
        id, 
        { permissions }, 
        { new: true }
      ).select('-password');
    }
    
    if (!updatedAdmin) {
      // Try Manager collection
      updatedAdmin = await User.findByIdAndUpdate(
        id, 
        { permissions }, 
        { new: true }
      ).select('-password');
    }
    
    if (!updatedAdmin) {
      // Try Support collection
      updatedAdmin = await User.findByIdAndUpdate(
        id, 
        { permissions }, 
        { new: true }
      ).select('-password');
    }
    
    if (!updatedAdmin) {
      // Try Viewer collection
      updatedAdmin = await User.findByIdAndUpdate(
        id, 
        { permissions }, 
        { new: true }
      ).select('-password');
    }
    
    if (!updatedAdmin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    res.json({ message: 'Admin permissions updated successfully', admin: updatedAdmin });
  } catch (error) {
    console.error('Error updating admin permissions:', error);
    res.status(500).json({ message: 'Error updating admin permissions', error: error.message });
  }
};

// Search admins
const searchAdmins = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const searchRegex = new RegExp(q, 'i');
    
    // Search in Admin collection
    const adminResults = await User.find({
      $and: [
        { $or: [{ role: 'admin' }, { isAdmin: true }] },
        {
          $or: [
            { email: searchRegex },
            { username: searchRegex },
            { firstName: searchRegex },
            { lastName: searchRegex },
            { role: searchRegex }
          ]
        }
      ]
    }).select('-password');
    
    // Search in other collections
    const customerResults = await User.find({
      $and: [
        { $or: [{ role: 'admin' }, { isAdmin: true }] },
        {
          $or: [
            { email: searchRegex },
            { username: searchRegex },
            { firstName: searchRegex },
            { lastName: searchRegex },
            { role: searchRegex }
          ]
        }
      ]
    }).select('-password');
    
    const businessOwnerResults = await User.find({
      $and: [
        { $or: [{ role: 'admin' }, { isAdmin: true }] },
        {
          $or: [
            { email: searchRegex },
            { username: searchRegex },
            { firstName: { $exists: true }, lastName: { $exists: true } },
            { role: searchRegex }
          ]
        }
      ]
    }).select('-password');
    
    const managerResults = await User.find({
      $and: [
        { $or: [{ role: 'admin' }, { isAdmin: true }] },
        {
          $or: [
            { email: searchRegex },
            { username: searchRegex },
            { firstName: { $exists: true }, lastName: { name: searchRegex } },
            { role: searchRegex }
          ]
        }
      ]
    }).select('-password');
    
    const supportResults = await User.find({
      $and: [
        { $or: [{ role: 'admin' }, { isAdmin: true }] },
        {
          $or: [
            { email: searchRegex },
            { username: searchRegex },
            { firstName: { $exists: true }, lastName: { $exists: true } },
            { role: searchRegex }
          ]
        }
        ]
    }).select('-password');
    
    const viewerResults = await User.find({
      $and: [
        { $or: [{ role: 'admin' }, { isAdmin: true }] },
        {
          $or: [
            { email: searchRegex },
            { username: searchRegex },
            { firstName: { $exists: true }, lastName: { $exists: true } },
            { role: 'admin' } // Viewers can't be admins, but include for completeness
          ]
        }
      ]
    }).select('-password');
    
    // Combine all results
    const allResults = [
      ...adminResults.map(admin => ({ ...admin.toObject(), collection: 'Admin' })),
      ...customerResults.map(admin => ({ ...admin.toObject(), collection: 'Customer' })),
      ...businessOwnerResults.map(admin => ({ ...admin.toObject(), collection: 'BusinessOwner' })),
      ...managerResults.map(admin => ({ ...admin.toObject(), collection: 'BusinessOwner' })),
      ...supportResults.map(admin => ({ ...admin.toObject(), collection: 'Support' })),
      ...viewerResults.map(admin => ({ ...admin.toObject(), collection: 'Viewer' }))
    ];
    
    res.json(allResults);
  } catch (error) {
    console.error('Error searching admins:', error);
    res.status(500).json({ message: 'Error searching admins', error: error.message });
  }
};

// Get all customers
const getAllCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' }).select('-password').sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    console.error('Error getting customers:', error);
    res.status(500).json({ message: 'Error fetching customers', error: error.message });
  }
};

// Get all business owners
const getAllBusinessOwners = async (req, res) => {
  try {
    const businessOwners = await User.find({ role: 'business_owner' }).select('-password').sort({ createdAt: -1 });
    res.json(businessOwners);
  } catch (error) {
    console.error('Error getting business owners:', error);
    res.status(500).json({ message: 'Error fetching business owners', error: error.message });
  }
};

// Promote user to business owner or admin
const promoteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, adminLevel, permissions, businessInfo, collection } = req.body;
    
    console.log('Promote user request:', { id, role, adminLevel, collection });
    
    // SECURITY: Always set adminLevel to 'admin' for invited/promoted users
    const secureAdminLevel = 'admin';
    const secureIsAdmin = false; // Never give super admin privileges to promoted users
    
    let promotedUser = null;
    
    // First, find the user to be promoted
    let userToPromote = null;
    if (collection === 'Customer') {
      userToPromote = await User.findById(id);
    } else if (collection === 'BusinessOwner') {
      userToPromote = await User.findById(id);
    }
    
    if (!userToPromote) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (role === 'business_owner') {
        promotedUser = await User.findByIdAndUpdate(
          id,
          {
            role: 'business_owner',
            isAdmin: secureIsAdmin,
            businessOwnerProfile: {
              businessInfo: businessInfo || {},
              businessStatus: 'pending_verification'
            }
          },
          { new: true }
        ).select('-password');
      } else if (role === 'admin') {
        promotedUser = await User.findByIdAndUpdate(
          id,
          {
            role: 'admin',
            isAdmin: true,
            adminProfile: {
              adminLevel: secureAdminLevel,
              permissions: permissions || []
            }
          },
          { new: true }
        ).select('-password');
      }
    
    if (!promotedUser) {
      return res.status(400).json({ message: 'Invalid promotion request' });
    }
    
    res.json({ 
      message: `User promoted to ${role} successfully!`, 
      user: promotedUser 
    });
    
  } catch (error) {
    console.error('Error promoting user:', error);
    res.status(500).json({ message: 'Error promoting user', error: error.message });
  }
};

// Get admin profile (for token validation)
const getAdminProfile = async (req, res) => {
  try {
    // req.user is set by authenticateAdminToken middleware
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Return the authenticated admin user
    res.json({ 
      admin: {
        _id: req.user._id,
        email: req.user.email,
        username: req.user.username,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        role: req.user.role,
        isAdmin: req.user.isAdmin,
        permissions: req.user.permissions || [],
        adminLevel: req.user.adminLevel
      }
    });
  } catch (error) {
    console.error('Error getting admin profile:', error);
    res.status(500).json({ message: 'Error fetching admin profile', error: error.message });
  }
};

module.exports = {
  isAdmin,
  adminLogin,
  getDashboardStats,
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getAllCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  updateUserRole,
  updateUserBusinessInfo,
  updateUserEmail,
  updateUserStatus,
  removeUser,
  inviteAdmin,
  updateUserPermissions,
  removeAdminRole,
  getAdminInvites,
  cancelAdminInvite,
  getAllAdmins,
  getAdminDetails,
  updateAdmin,
  deleteAdmin,
  updateAdminStatus,
  updateAdminPermissions,
  searchAdmins,
  getAllCustomers,
  getAllBusinessOwners,
  promoteUser,
  getAdminProfile
}; 