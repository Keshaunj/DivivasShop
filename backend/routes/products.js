const express = require('express');
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require('../controllers/productController')

// method-GET-PUT | ETC --->/api/products 

router.get('/',createProduct)
router.get('/',getAllProducts)
router.get('/:id',getProductById)
router.get('/:id',updateProduct)
router.get('/:id',deleteProduct)


module.exports = router;