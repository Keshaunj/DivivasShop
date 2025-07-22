const express = require('express');
const router = express.Router();
const { protect } = require('../utils/jwt');
const {
  getUserDashboard,
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  deleteUserAccount,
  addAddress,
  updateAddress
} = require('../controllers/userControllers');

router.use(protect); // Protect all routes

// GET /api/users/dashboard
router.get('/dashboard', getUserDashboard);

// GET/PUT /api/users/profile
router.route('/profile')
  .get(getUserProfile)
  .put(updateUserProfile);

// PUT /api/users/change-password
router.put('/change-password', changeUserPassword);

// DELETE /api/users/
router.delete('/', deleteUserAccount);

// POST /api/users/address
router.post('/address', addAddress);

// PUT /api/users/address/:addressId
router.put('/address/:addressId', updateAddress);

module.exports = router;