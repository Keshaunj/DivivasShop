const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 
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
    select: false
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


userSchema.pre('save', async function(next) {

  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12); 
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});


userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};


userSchema.plugin(sanitize);

module.exports = mongoose.model('User', userSchema);