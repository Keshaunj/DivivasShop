const express = require('express');
const router = express.Router();
const { signupUser, loginUser, logoutUser } = require('../controllers/authController');
const { validateSignup, validateLogin } = require('../middleware/validation');



// /api/auth/signup
router.post('/signup', validateSignup, signupUser);


router.post('/login', validateLogin, loginUser);


router.post('/logout', logoutUser);

module.exports = router;