const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../utils/authentication/jwt'); // Updated import path
const { isAdmin } = require('../middleware/permissions'); // Use new permission middleware
const {
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
  inviteAdmin,
  updateUserPermissions,
  removeAdminRole,
  getAdminInvites,
  cancelAdminInvite
} = require('../controllers/adminController');

// Apply authentication and admin middleware to all routes
router.use(authenticateToken);
router.use(isAdmin);

// Dashboard
router.get('/stats', getDashboardStats);

// Products
router.get('/products', getAllProducts);
router.post('/products', addProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Categories
router.get('/categories', getAllCategories);
router.post('/categories', addCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Orders
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

// Users
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/business-info', updateUserBusinessInfo);

// Admin Management
router.post('/invite', inviteAdmin);
router.put('/users/:id/permissions', updateUserPermissions);
router.put('/users/:id/remove-admin', removeAdminRole);
router.get('/invites', getAdminInvites);
router.delete('/invites/:id/cancel', cancelAdminInvite);

module.exports = router; 