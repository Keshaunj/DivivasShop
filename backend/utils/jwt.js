const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';


const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};


const protect = (req, res, next) => {
 
  const token = req.cookies.jwt || req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Not authorized - no token' });
  }

 
  try {
    const decoded = verifyToken(token);
    req.user = decoded; 
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized - invalid token' });
  }
};

module.exports = { generateToken, verifyToken, protect };