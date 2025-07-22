const express = require('express');
const router = express.Router();
const Category = require('../models/categories');
const { protect, admin } = require('../utils/jwt');

// GET /api/categories (public)
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch categories',
      details: error.message 
    });
  }
});

// POST /api/categories (admin only)
router.post('/', protect, admin, async (req, res) => {
  try {
    const newCategory = new Category(req.body);
    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(400).json({ 
      error: 'Failed to create category',
      details: error.message
    });
  }
});

module.exports = router;