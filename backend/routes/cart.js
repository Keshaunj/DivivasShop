const express = require('express');
const router = express.Router();
const {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  checkout
} = require('../controllers/cartController');
const { authenticateToken } = require('../utils/authentication/jwt'); // Updated import path

// All cart routes require authentication
router.use(authenticateToken);

// GET /api/cart - Get user's cart
router.get('/', getCart);

// POST /api/cart - Add item to cart
router.post('/', addToCart);

// PUT /api/cart - Update cart item quantity
router.put('/', updateCartItem);

// DELETE /api/cart/:productId - Remove item from cart
router.delete('/:productId', removeFromCart);

// DELETE /api/cart - Clear entire cart
router.delete('/', clearCart);

// POST /api/cart/checkout - Checkout (convert cart to order)
router.post('/checkout', checkout);

module.exports = router; 