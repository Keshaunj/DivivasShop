const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const { protect } = require('../utils/jwt');

router.use(protect); // Protect all routes

// GET /api/orders (user's orders only)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('products.product');
    res.json(orders);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch orders',
      details: error.message
    });
  }
});

// POST /api/orders
router.post('/', async (req, res) => {
  try {
    const order = new Order({
      ...req.body,
      user: req.user.id
    });
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({
      error: 'Failed to create order',
      details: error.message
    });
  }
});

module.exports = router;