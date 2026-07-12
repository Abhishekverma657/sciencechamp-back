const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Registration = require('../models/Registration');

const User = require('../models/User');

// @desc    Create Razorpay Order (Public / Registration)
// @route   POST /api/v1/payment/create
// @access  Public
const createPayment = async (req, res) => {
    try {
        const { registration_uuid } = req.body;

        if (!registration_uuid) {
            return res.status(400).json({ success: false, message: 'registration_uuid is required' });
        }

        // Find user by phone (registration_uuid)
        const user = await User.findOne({ phone: registration_uuid });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const registration = await Registration.findOne({ userId: user._id }).sort({ createdAt: -1 });
        if (!registration) {
            return res.status(404).json({ success: false, message: 'Registration not found' });
        }

        const amount = 1; // Testing fee in INR

        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const options = {
            amount: amount * 100, // amount in smallest currency unit (paise)
            currency: "INR",
            receipt: `receipt_${Math.floor(Math.random() * 10000)}`
        };

        const order = await instance.orders.create(options);

        if (!order) return res.status(500).json({ success: false, message: "Some error occured in razorpay" });

        // Save payment record as created
        const payment = await Payment.create({
            userId: user._id,
            registrationId: registration._id,
            razorpayOrderId: order.id,
            amount: amount,
            status: 'created'
        });

        res.json({ 
            success: true, 
            data: {
                razorpay_order_id: order.id,
                razorpay_key_id: process.env.RAZORPAY_KEY_ID,
                amount: options.amount, // Razorpay expects paise in options.amount
                order_id: payment._id // Custom DB payment ID to verify later
            } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/v1/payment/verify/:paymentId
// @access  Public
const verifyPayment = async (req, res) => {
    try {
        const paymentId = req.params.paymentId;
        const {
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        // Ensure we have the necessary fields
        if (!razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: "Missing razorpay payment details" });
        }

        const payment = await Payment.findById(paymentId);
        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment not found" });
        }

        const sign = payment.razorpayOrderId + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            // Update Payment Status
            payment.razorpayPaymentId = razorpay_payment_id;
            payment.razorpaySignature = razorpay_signature;
            payment.status = 'success';
            await payment.save();

            // Also update Registration status to completed
            if (payment.registrationId) {
                await Registration.findByIdAndUpdate(payment.registrationId, { status: 'completed' });
            }

            return res.status(200).json({ success: true, message: "Payment verified successfully" });
        } else {
            payment.status = 'failed';
            await payment.save();
            return res.status(400).json({ success: false, message: "Invalid signature sent!" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all payments (Admin)
// @route   GET /api/v1/payment/all
// @access  Private/Admin
const getAllPayments = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        
        let query = {};
        
        // Frontend sends 'student_id' which is actually the registration ID
        if (req.query.student_id) {
            query.registrationId = req.query.student_id;
        }
        if (req.query.status) {
            query.status = req.query.status;
        }

        const totalRecords = await Payment.countDocuments(query);
        const payments = await Payment.find(query)
            .populate('userId')
            .populate('registrationId')
            .sort({ createdAt: req.query.sortOrder === 'ASC' ? 1 : -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.json({ 
            success: true, 
            data: {
                payments: payments,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalRecords / limit),
                    totalRecords,
                    limit,
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update Payment (Admin)
// @route   PUT /api/v1/payment/:paymentId
// @access  Private/Admin
const updatePayment = async (req, res) => {
    try {
        const paymentId = req.params.paymentId;
        const updateData = req.body;

        const payment = await Payment.findByIdAndUpdate(
            paymentId,
            updateData,
            { new: true }
        );

        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }

        // Also update Registration status if payment is marked as success
        if (updateData.status === 'success' && payment.registrationId) {
            await Registration.findByIdAndUpdate(payment.registrationId, { status: 'completed' });
        }

        res.json({ success: true, message: 'Payment updated successfully', data: payment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createPayment,
    verifyPayment,
    getAllPayments,
    updatePayment
};
