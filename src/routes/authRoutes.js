const express = require('express');
const router = express.Router();
const { adminLogin, sendStudentOTP, verifyStudentOTP, logout } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// Admin Auth
router.post('/admin/login', adminLogin);

// Student Auth
router.post('/student/auth/send-otp', sendStudentOTP);
router.post('/student/auth/verify-otp-login', verifyStudentOTP);

// Logout (Used by both)
router.post('/logout', protect, logout);

module.exports = router;
