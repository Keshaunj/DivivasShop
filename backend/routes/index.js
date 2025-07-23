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


router.get('/home', (req, res) => {
 res.json ({message:"working!"})

});

router.get('/test', (req, res) =>
     res.json({ message: "works!"}));

module.exports = router;