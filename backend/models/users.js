const mongoose = require('mongoose');
const sanitize = require('mongoose-sanitize');

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true,
    unique: true,
    lowercase: true
  },   
  password: { 
    type: String, 
    required: true,
    select: false // Never return in queries
  },
  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String
  }
}, {
  timestamps: true
});

userSchema.plugin(sanitize); // Only applied to User model

module.exports = mongoose.model('User', userSchema);