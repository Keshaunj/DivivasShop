const express = require('express');
const router = express.Router();
const { authenticateBusinessOwnerToken } = require('../utils/authentication/businessOwnerJWT');
const { isSuperAdmin } = require('../middleware/businessOwnerAuth');
const {
  registerBusinessOwner,
  loginBusinessOwner,
  logoutBusinessOwner,
  getBusinessOwnerProfile,
  updateBusinessOwnerProfile,
  getAllBusinessOwners,
  getBusinessOwnerById,
  updateBusinessOwnerStatus,
  getBusinessOwnerStats
} = require('../controllers/businessOwnerController');

// Public routes (no authentication required)
router.post('/register', registerBusinessOwner);
router.post('/login', loginBusinessOwner);

// Protected routes (require business owner authentication)
router.use(authenticateBusinessOwnerToken);

// Business owner profile and dashboard
router.get('/profile', getBusinessOwnerProfile);
router.put('/profile', updateBusinessOwnerProfile);
router.get('/stats', getBusinessOwnerStats);
router.post('/logout', logoutBusinessOwner);

// Admin routes (require super admin access)
router.use(isSuperAdmin);

// Business owner management (super admin only)
router.get('/all', getAllBusinessOwners);
router.get('/:id', getBusinessOwnerById);
router.put('/:id/status', updateBusinessOwnerStatus);

module.exports = router; 