const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    registrationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Registration' },
    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    amount: { type: Number, required: true },
    status: { type: String, default: 'created' }, // created, success, failed
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
