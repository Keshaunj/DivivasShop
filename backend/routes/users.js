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


router.use(protect);


router.get('/dashboard', getUserDashboard);
router.route('/profile')
  .get(getUserProfile)
  .put(updateUserProfile);


router.put('/change-password', changeUserPassword);
router.delete('/', deleteUserAccount);


router.post('/address', addAddress);
router.put('/address/:addressId', updateAddress);

module.exports = router;