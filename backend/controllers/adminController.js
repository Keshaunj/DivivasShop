const Product = require('../models/products');
const Category = require('../models/categories');
const Order = require('../models/order');
const User = require('../models/users');

// Admin middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user.role !== 'admin' && !req.user.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  next();
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
          await User.findByIdAndUpdate(req.user._id, { permissions: defaultPermissions });
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
        totalUsers = await User.countDocuments();
        totalBusinesses = await User.countDocuments({ role: 'admin' });
        totalAdmins = await User.countDocuments({ 
          $or: [{ role: 'admin' }, { isAdmin: true }] 
        });
        
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
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    const validRoles = ['user', 'admin', 'manager', 'support', 'viewer'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        message: `Invalid role: ${role}. Valid roles are: ${validRoles.join(', ')}` 
      });
    }
    
    // Only set isAdmin for admin role, not for manager/support/viewer
    const isAdmin = role === 'admin';
    
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { 
        role,
        isAdmin
      },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
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
    
    // Validate business info structure
    if (!businessInfo || typeof businessInfo !== 'object') {
      return res.status(400).json({ message: 'Invalid business information' });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { businessInfo },
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
    
    // Check if new email is already taken by another user
    const existingUser = await User.findOne({ email, _id: { $ne: id } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already taken by another user' });
    }
    
    // Update user email
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { email },
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
    
    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent deactivating super admins
    if (user.role === 'admin' && user.isAdmin === true && !isActive) {
      return res.status(403).json({ message: 'Cannot deactivate super admin users. Contact another super admin if needed.' });
    }
    
    // Update user status
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user status', error: error.message });
  }
};

// Remove user (Super Admin only)
const removeUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent removing super admins (including the requesting user)
    if (user.role === 'admin' && user.isAdmin === true) {
      return res.status(403).json({ message: 'Cannot remove super admin users. Contact another super admin if needed.' });
    }
    
    // Prevent removing the last super admin
    if (user.role === 'admin') {
      const superAdminCount = await User.countDocuments({ role: 'admin', isAdmin: true });
      if (superAdminCount <= 1) {
        return res.status(403).json({ message: 'Cannot remove the last super admin. At least one super admin must remain.' });
      }
    }
    
    // Remove the user
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
    const { email, role, permissions } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create admin invitation
    const AdminInvite = require('../models/adminInvite');
    const invite = new AdminInvite({
      email,
      role,
      permissions,
      invitedBy: req.user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    await invite.save();

    // TODO: Send email invitation
    // await sendAdminInviteEmail(invite);

    res.status(201).json({ 
      message: 'Admin invitation sent successfully',
      invite: {
        id: invite._id,
        email: invite.email,
        role: invite.role,
        expiresAt: invite.expiresAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error sending admin invitation', error: error.message });
  }
};

// Update user permissions
const updateUserPermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { permissions },
      { new: true }
    ).select('-password');
    
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
    
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { 
        role: 'user',
        isAdmin: false,
        permissions: [],
        adminNotes: 'Admin role removed'
      },
      { new: true }
    ).select('-password');
    
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

module.exports = {
  isAdmin,
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
  cancelAdminInvite
}; 