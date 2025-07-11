const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },   
  password: { type: String, required: true },
  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String
  }
}); 

module.exports = mongoose.model('User', userSchema); 
