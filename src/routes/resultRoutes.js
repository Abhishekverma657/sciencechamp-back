const express = require('express');
const router = express.Router();
const { uploadResult, getAllResults, getMyResult } = require('../controllers/resultController');
const { protect, adminProtect } = require('../middlewares/authMiddleware');
const { sendStudentOTP, verifyStudentOTP } = require('../controllers/authController');

// Admin routes
router.post('/admin/upload', protect, adminProtect, uploadResult);
router.get('/admin/all', protect, adminProtect, getAllResults);

// OTP Verification for checking result (Public)
router.post('/send-otp', sendStudentOTP);
router.post('/verify-otp', verifyStudentOTP);
router.post('/resend-otp', sendStudentOTP);

// Protected student route (requires token after OTP)
router.get('/my-result', protect, getMyResult);

module.exports = router;
