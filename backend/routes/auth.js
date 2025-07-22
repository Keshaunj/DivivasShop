const express = require('express');
const router = express.Router();
const {
  signupUser,
  loginUser,
  logoutUser
} = require('../controllers/authController');
const {
  validateSignup,
  validateLogin
} = require('../middleware/validation');

// POST /api/auth/signup
router.post('/signup', validateSignup, signupUser);

// POST /api/auth/login
router.post('/login', validateLogin, loginUser);

// POST /api/auth/logout
router.post('/logout', logoutUser);

module.exports = router;