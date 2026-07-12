const express = require('express');
const router = express.Router();
const { createPayment, verifyPayment, getAllPayments, updatePayment } = require('../controllers/paymentController');
const { protect, adminProtect } = require('../middlewares/authMiddleware');

router.post('/create', createPayment);
router.post('/verify/:paymentId', verifyPayment);

// For admin
router.get('/all', protect, adminProtect, getAllPayments);
router.put('/:paymentId', protect, adminProtect, updatePayment);

// These were also in endpoints, mapping to basic create for now
router.post('/create-authenticated', protect, createPayment);
router.post('/manual-create', protect, adminProtect, createPayment);

module.exports = router;
