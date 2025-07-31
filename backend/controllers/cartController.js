const User = require('../models/users');
const Product = require('../models/products');
const Order = require('../models/order');

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user.id;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get user and their cart
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize cart if it doesn't exist
    if (!user.cart) {
      user.cart = [];
    }

    // Check if product already in cart
    const existingItemIndex = user.cart.findIndex(
      item => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity if product already in cart
      user.cart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      user.cart.push({
        product: productId,
        quantity: quantity,
        price: product.price
      });
    }

    await user.save();

    // Populate product details for response
    await user.populate('cart.product');

    res.json({
      message: 'Item added to cart',
      cart: user.cart
    });

  } catch (error) {
    res.status(500).json({
      message: 'Error adding item to cart',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get user's cart
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate('cart.product');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      cart: user.cart || []
    });

  } catch (error) {
    res.status(500).json({
      message: 'Error fetching cart',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than 0' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const itemIndex = user.cart.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    user.cart[itemIndex].quantity = quantity;
    await user.save();

    await user.populate('cart.product');

    res.json({
      message: 'Cart updated',
      cart: user.cart
    });

  } catch (error) {
    res.status(500).json({
      message: 'Error updating cart',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.cart = user.cart.filter(
      item => item.product.toString() !== productId
    );

    await user.save();

    res.json({
      message: 'Item removed from cart',
      cart: user.cart
    });

  } catch (error) {
    res.status(500).json({
      message: 'Error removing item from cart',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Clear entire cart
const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.cart = [];
    await user.save();

    res.json({
      message: 'Cart cleared',
      cart: []
    });

  } catch (error) {
    res.status(500).json({
      message: 'Error clearing cart',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Checkout - convert cart to order
const checkout = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shippingAddress, paymentMethod } = req.body;

    const user = await User.findById(userId).populate('cart.product');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.cart || user.cart.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate total
    const total = user.cart.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    // Create order
    const order = new Order({
      user: userId,
      items: user.cart.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price
      })),
      total: total,
      shippingAddress: shippingAddress || user.address,
      paymentMethod: paymentMethod || 'credit_card',
      status: 'pending'
    });

    await order.save();

    // Clear cart after successful order
    user.cart = [];
    await user.save();

    res.status(201).json({
      message: 'Order created successfully',
      order: order
    });

  } catch (error) {
    res.status(500).json({
      message: 'Error during checkout',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  checkout
}; 