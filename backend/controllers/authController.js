const jwt = require('jsonwebtoken');
const User = require('../models/users');
require('dotenv').config();

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000 
};

const signupUser = async (req, res) => {
  try {
    const { username, email, password, address } = req.body;

 
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'User already exists' });
    }


    const newUser = await User.create({ 
      username, 
      email, 
      password, 
      address 
    });

   
    const token = jwt.sign(
      { id: newUser._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    
    res.cookie('jwt', token, cookieOptions);
    res.status(201).json({
      message: 'User created successfully',
      user: newUser.toJSON() 
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Signup error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

  
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' }); 
    }

   
    if (!(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' }); 
    }

   
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

   
    res.cookie('jwt', token, cookieOptions);
    res.json({
      message: 'Login successful',
      user: user.toJSON() 
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Login error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const logoutUser = (req, res) => {
  res.clearCookie('jwt');
  res.json({ message: 'Logged out successfully' });
};

module.exports = {
  signupUser,
  loginUser,
  logoutUser
};