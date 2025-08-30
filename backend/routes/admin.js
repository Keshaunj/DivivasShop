const express = require('express');
const router = express.Router();
const { authenticateAdminToken } = require('../utils/authentication/jwt'); // Use admin authentication
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
  updateUserEmail,
  updateUserStatus,
  removeUser,
  inviteAdmin,
  updateUserPermissions,
  removeAdminRole,
  getAdminInvites,
  cancelAdminInvite,
  adminLogin,
  getAllAdmins,
  getAdminDetails,
  updateAdmin,
  deleteAdmin,
  updateAdminStatus,
  updateAdminPermissions,
  searchAdmins,
  getAllCustomers,
  getAllBusinessOwners,
  promoteUser
} = require('../controllers/adminController');

// Admin login route (no authentication required)
router.post('/login', adminLogin);

// Apply admin authentication and admin middleware to all other routes
router.use(authenticateAdminToken);
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
router.put('/users/:id/email', updateUserEmail);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', removeUser);

// Customer and Business Owner Management
router.get('/customers', getAllCustomers);
router.get('/business-owners', getAllBusinessOwners);
router.put('/users/:id/promote', promoteUser);

// Admin Management
router.post('/invite', inviteAdmin);
router.put('/users/:id/permissions', updateUserPermissions);
router.put('/users/:id/remove-admin', removeAdminRole);
router.get('/invites', getAdminInvites);
router.delete('/invites/:id/cancel', cancelAdminInvite);

// Admin Users Management
router.get('/admins', getAllAdmins);
router.get('/admins/:id', getAdminDetails);
router.put('/admins/:id', updateAdmin);
router.delete('/admins/:id', deleteAdmin);
router.put('/admins/:id/status', updateAdminStatus);
router.put('/admins/:id/permissions', updateAdminPermissions);
router.get('/admins/search', searchAdmins);

module.exports = router; 