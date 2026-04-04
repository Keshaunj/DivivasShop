/**
 * Public /api/categories — MongoDB `categories` collection is NOT IN USE YET (see models/categories.js).
 * GET returns [] so the admin product form can rely on mergeCategoryOptions() on the client.
 */
// const Category = require('../models/categories');

const getAllCategories = async (req, res) => {
  try {
    // const categories = await Category.find().sort({ name: 1 });
    // res.json(categories);
    res.json([]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

const createCategory = async (req, res) => {
  // try {
  //   const newCategory = new Category(req.body);
  //   const savedCategory = await newCategory.save();
  //   res.status(201).json(savedCategory);
  // } catch (err) {
  //   res.status(400).json({ error: 'Failed to create category' });
  // }
  res.status(501).json({ error: 'Category collection not in use yet' });
};

module.exports = {
  getAllCategories,
  createCategory
};
