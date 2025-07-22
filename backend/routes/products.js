const express = require('express');
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect } = require('../utils/jwt'); // Only import what exists

// GET /api/products (public)
router.get('/', getAllProducts);

// POST /api/products (protected only)
router.post('/', protect, createProduct); // Removed admin

// GET /api/products/:id (public)
router.get('/:id', getProductById);

// PUT /api/products/:id (protected only)
router.put('/:id', protect, updateProduct); // Removed admin

// DELETE /api/products/:id (protected only)
router.delete('/:id', protect, deleteProduct); // Removed admin

module.exports = router;