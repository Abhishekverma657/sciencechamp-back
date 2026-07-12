const Registration = require('../models/Registration');
const Payment = require('../models/Payment');

// @desc    Get Student Dashboard
// @route   GET /api/v1/student/dashboard
// @access  Private
const getDashboard = async (req, res) => {
    try {
        const registration = await Registration.findOne({ userId: req.user.id });
        const payments = await Payment.find({ userId: req.user.id });

        res.json({
            success: true,
            data: {
                registration,
                payments,
                stats: {
                    totalPayments: payments.length,
                    status: registration ? registration.status : 'Not Registered'
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get Student Payments
// @route   GET /api/v1/student/payments
// @access  Private
const getStudentPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ userId: req.user.id }).sort('-createdAt');
        res.json({ success: true, data: payments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Mark Admit Card Downloaded
// @route   POST /api/v1/student/admit-card/mark-downloaded
// @access  Private
const markAdmitCardDownloaded = async (req, res) => {
    try {
        // Here you could update a flag in registration model
        await Registration.findOneAndUpdate(
            { userId: req.user.id },
            { $set: { admitCardDownloaded: true } }
        );
        res.json({ success: true, message: 'Admit card marked as downloaded' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getDashboard,
    getStudentPayments,
    markAdmitCardDownloaded
};
