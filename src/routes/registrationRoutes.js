const express = require('express');
const router = express.Router();
const { registerStep1, defenceRegister, getStates, getRegistration, updateRegistration } = require('../controllers/registrationController');
const { protect } = require('../middlewares/authMiddleware');
const { sendStudentOTP, verifyStudentOTP } = require('../controllers/authController');

// Standard Registration
router.post('/register/step1', registerStep1);
router.post('/defence-register/register', defenceRegister);

// State list
router.get('/states', getStates);

// OTP routes for registration (often same as login if phone based)
router.post('/register/send-otp', sendStudentOTP);
router.post('/register/verify-otp', verifyStudentOTP);
router.post('/register/resend-otp', sendStudentOTP);

// Protected routes
router.get('/register/registration', protect, getRegistration);
router.put('/register/registration', protect, updateRegistration);

module.exports = router;
