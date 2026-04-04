/**
 * Category model — NOT IN USE YET
 *
 * Product categories are stored as plain strings on each Product (`product.category`).
 * The admin UI builds the dropdown from in-code defaults + this API (empty until enabled).
 * When you want a shared `categories` collection, wire controllers back to Category.find/save
 * and consider changing Product.category to ObjectId ref.
 */
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Category', categorySchema);
