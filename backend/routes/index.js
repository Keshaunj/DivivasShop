const express = require('express');
const router = express.Router();


const authRouter = require('./auth');
const userRoutes = require('./users');
const productRoutes = require('./products');
const categoryRoutes = require('./categories');
const orderRoutes = require('./orders');


router.use('/auth', authRouter);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/orders', orderRoutes);
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Our E-Commerce API',
    version: '1.0',
    docs: 'https://docs.your-api.com' 
    
  });
});


module.exports = router;



