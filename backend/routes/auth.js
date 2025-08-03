const express = require('express');
const router = express.Router();
const {
  signupUser,
  loginUser,
  logoutUser,
  getMe,
  requestPasswordReset,
  resetPassword,
  verifyResetToken
} = require('../controllers/authController');
const {
  validateSignup,
  validateLogin
} = require('../middleware/validation');
const { authenticateToken } = require('../utils/authentication/jwt');

// POST /api/auth/signup
router.post('/signup', signupUser);

// POST /api/auth/login
router.post('/login', loginUser);

// POST /api/auth/logout
router.post('/logout', logoutUser);

// GET /api/auth/me - Check authentication status
router.get('/me', getMe);

// Password reset routes
// POST /api/auth/forgot-password
router.post('/forgot-password', requestPasswordReset);

// POST /api/auth/reset-password
router.post('/reset-password', resetPassword);

// GET /api/auth/verify-reset-token/:token
router.get('/verify-reset-token/:token', verifyResetToken);

module.exports = router;