const Product = require('../models/products');


const getAllProducts = async (req, res) => {
  try {
    const { category } = req.query;
    
    // Build filter object
    let filter = {};
    
    // If category is provided, filter by category
    if (category) {
      // Find category by name (case-insensitive)
      const Category = require('../models/categories');
      const categoryDoc = await Category.findOne({ 
        name: { $regex: new RegExp(category, 'i') } 
      });
      
      if (categoryDoc) {
        filter.category = categoryDoc._id;
      } else {
        // If category not found, return empty array
        return res.json([]);
      }
    }
    
    const products = await Product.find(filter).populate('category');
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};


const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};


const createProduct = async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create product' });
  }
};


const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedProduct) return res.status(404).json({ error: 'Product not found' });
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update product' });
  }
};


const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
