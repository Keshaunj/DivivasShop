const bcrypt = require('bcrypt');
const User = require('../models/users')
const jwt = require('jsonwebtoken')

const signupUser = async (req, res) => {
  try {
    const { username, email, password, address } = req.body;


    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

 
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      address,
    });

  
    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Signup error', error: error.message });
  }
};


const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;


    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });



const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

  
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login error', error: error.message });
  }
};
  const logoutUser = (req, res) => {
 
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Logout failed' });
      }
      res.clearCookie('connect.sid');
      res.json({ message: 'User logged out successfully' });
    });
  } else {
    
    res.json({ message: 'User logged out' });
  }
};



module.exports = {
    signupUser,
    loginUser,
    logoutUser
};

