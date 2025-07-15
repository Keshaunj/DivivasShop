const express = require('express');
const router = express.Router();
const { signupUser, loginUser, logoutUser } = require('../controllers/authController');
const {
 getUserDashboard,
    getUserProfile,
    updateUserProfile,
    changeUserPassword,
    deleteUserAccount,
    addAddress,
    updateAddress
} = require('../controllers/userControllers')




router.get('/categories',(req,res)=>{
    res.json({message: 'Catergories for Users'})
})
router.get('/orders', (req,res)=>{
    res.json({message: 'Users Orders'})
})
router.get('/products',(req,res)=>{
    res.json({message: 'Products for Users'})
})



router.get('/dashboard',getUserDashboard)
router.get('/profile',getUserProfile)
router.put('/profile',updateUserProfile)
router.put('/change-password',changeUserPassword)
router.delete('/delete-user',deleteUserAccount)
router.post('/add-address',addAddress)
router.put('/update-address',updateAddress)
router.post('/signup',signupUser)
router.post('/login',loginUser)
router.post('/logout',logoutUser)













// Checkout route pseudocode
router.post('/checkout', (req, res) => {
  // 1. Get cart items and payment info from req.body
  // 2. Validate cart items (check stock, prices, etc)
  // 3. Calculate total amount including taxes, discounts
  // 4. Process payment with payment gateway (e.g., Stripe, PayPal)
  // 5. If payment successful:
  //    - Create order record in database
  //    - Clear user's cart
  //    - Send success response with order details
  // 6. If payment fails:
  //    - Send error response
  res.json({ message: 'Checkout route - logic to be implemented' });
});


module.exports = router;