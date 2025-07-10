const bcrypt = require('bcrypt');
const User = require("../models/User")

const signupUser = async (req,res) => {
    try {
        const { username, password } = req.body;

        const existingUser = await User.findOne({username});
        if (existingUser) {
            return res.status(400).json({error: 'Username alrready taken'})
           
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ username,password: hashedPassword});
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully'});
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Signup failed'})
    }
};

const loginUser = async (req,res) => {
    try {
        const {username , password} =req.body;
    
        const user = await User.findOne({username});
        if (!user) {
            return res.status(400).json({ error: "invalid username or password"});
         }
         const isMatch = await bcrypt.compare(password,user.passowrd);
         if (!isMatch) {
            return res.status(400).json({error: "Invalid username or password"})
         }
             
             res.json({ message: 'Login successful'});
        }catch (error) {
            res.status(500).json ({ error: 'Login failed'});
        }
    }
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

