const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { sendSmsOTP } = require('../services/smsService');

// Generate JWT
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Admin Login
// @route   POST /api/v1/admin/login
// @access  Public
const adminLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const admin = await Admin.findOne({ email });

        if (admin && (await admin.matchPassword(password))) {
            const token = generateToken(admin._id, 'admin');
            res.json({
                success: true,
                data: {
                    user: { id: admin._id, email: admin.email, role: 'admin' },
                    token: token,
                    refreshToken: token // using same for simplicity right now
                }
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Send OTP to Student
// @route   POST /api/v1/student/auth/send-otp OR /api/v1/register/send-otp
// @access  Public
const sendStudentOTP = async (req, res) => {
    const phone = req.body.phone || req.body.mobile_number || req.body.registration_uuid;

    if (!phone) {
        return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    try {
        // Send SMS (or generate it)
        const smsResponse = await sendSmsOTP(phone);
        
        // Save OTP to DB
        await OTP.create({
            phone: phone,
            otp: smsResponse.otp,
            // we can temporarily store uuid in phone or create a new field if needed
            // Wait, OTP model might not have registration_uuid. I will just store it in phone or add it to schema
        });
        
        // Since OTP model doesn't have registration_uuid by default, let's just find by phone in verify if we don't change schema.
        // But frontend sends registration_uuid and otp to verify.
        // Let's check how OTP model is defined. Actually I can just return registration_uuid = phone temporarily if I don't want to change OTP schema.
        // Better: let's just return registration_uuid as the phone number for now, so verify can use it.
        // Wait, uuidv4 is better. Let's assume we can change the OTP model or just add it to OTP document if it's flexible (mongoose strict mode might strip it).
        
        // Let's just use the phone as the registration_uuid for simplicity in the OTP process since it's unique per verification flow
        // OR we can pass it as a custom field. Let's just use phone as registration_uuid.

        res.json({ 
            success: true, 
            message: 'OTP sent successfully',
            data: { registration_uuid: phone } // Using phone as UUID so we can find it in verify
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Verify OTP & Login Student
// @route   POST /api/v1/student/auth/verify-otp-login OR /api/v1/register/verify-otp
// @access  Public
const verifyStudentOTP = async (req, res) => {
    const phone = req.body.phone || req.body.registration_uuid;
    const otp = req.body.otp;

    if (!phone || !otp) {
        return res.status(400).json({ success: false, message: 'Phone/UUID and OTP are required' });
    }

    try {
        // Find OTP record
        const otpRecord = await OTP.findOne({ phone, otp });

        if (!otpRecord) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        // Delete OTP record after successful verification
        await OTP.deleteOne({ _id: otpRecord._id });

        // Check if this is a login request (has phone directly) or registration
        if (req.body.phone) {
            // Login flow
            let user = await User.findOne({ phone });
            if (!user) {
                user = await User.create({ phone, isVerified: true });
            }
            const token = generateToken(user._id, 'student');
            return res.json({
                success: true,
                data: {
                    user: { id: user._id, phone: user.phone, role: 'student' },
                    token: token,
                    refreshToken: token
                }
            });
        }

        // Registration flow
        res.json({
            success: true,
            message: 'OTP verified successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Logout User
// @route   POST /api/v1/logout
// @access  Private
const logout = async (req, res) => {
    // With JWT, logout is usually handled client-side by deleting the token.
    // We just return a success message.
    res.json({ success: true, message: 'Logged out successfully' });
};

module.exports = {
    adminLogin,
    sendStudentOTP,
    verifyStudentOTP,
    logout
};
