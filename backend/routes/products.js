const express = require('express');
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { authenticateToken } = require('../utils/authentication/jwt'); // Updated import path

// GET /api/products (public)
router.get('/', getAllProducts);

// POST /api/products (protected only)
router.post('/', authenticateToken, createProduct); // Updated middleware name

// GET /api/products/:id (public)
router.get('/:id', getProductById);

// PUT /api/products/:id (protected only)
router.put('/:id', authenticateToken, updateProduct); // Updated middleware name

// DELETE /api/products/:id (protected only)
router.delete('/:id', authenticateToken, deleteProduct); // Updated middleware name

module.exports = router;