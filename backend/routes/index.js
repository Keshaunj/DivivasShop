const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const userRoutes = require('./users');
const productRoutes = require('./products');
const categoryRoutes = require('./categories');
const orderRoutes = require('./orders');
const cartRoutes = require('./cart');
const adminRoutes = require('./admin');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/orders', orderRoutes);
router.use('/cart', cartRoutes);
router.use('/admin', adminRoutes);

router.get('/home', (req, res) => {
  res.json({
    message: "Welcome to Divias Wicka Shop!",
    // Add more dashboard data here as needed
  });
});

module.exports = router;