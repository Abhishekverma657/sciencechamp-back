const express = require('express');
const router = express.Router();
const { getDashboard, getStudentPayments, markAdmitCardDownloaded } = require('../controllers/studentController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/dashboard', protect, getDashboard);
router.get('/payments', protect, getStudentPayments);
router.post('/admit-card/mark-downloaded', protect, markAdmitCardDownloaded);

module.exports = router;
