const express = require('express');
const router = express.Router();
const {
  signupUser,
  loginUser,
  logoutUser,
  getMe
} = require('../controllers/authController');
const {
  validateSignup,
  validateLogin
} = require('../middleware/validation');
const { authenticateToken } = require('../utils/jwt');

// POST /api/auth/signup
router.post('/signup', validateSignup, signupUser);

// POST /api/auth/login
router.post('/login', validateLogin, loginUser);

// POST /api/auth/logout
router.post('/logout', logoutUser);

// GET /api/auth/me - Check authentication status
router.get('/me', authenticateToken, getMe);

module.exports = router;