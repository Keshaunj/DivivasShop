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
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();
    
    // Calculate total revenue
    const orders = await Order.find({ status: 'completed' });
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    
    // Get recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'username email');
    
    // Get low stock products
    const lowStockProducts = await Product.find({ stock: { $lt: 10 } })
      .select('name stock price')
      .limit(5);
    
    res.json({
      stats: {
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue: totalRevenue.toFixed(2)
      },
      recentOrders,
      lowStockProducts
    });
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
    
    const validRoles = ['user', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { 
        role,
        isAdmin: role === 'admin'
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
  inviteAdmin,
  updateUserPermissions,
  removeAdminRole,
  getAdminInvites,
  cancelAdminInvite
}; 