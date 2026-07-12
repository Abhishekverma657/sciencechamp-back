const express = require('express');
const router = express.Router();
const { 
    getDashboardStats, 
    getAllRegistrations, 
    getEnquiries, 
    getDefenceRegistrations, 
    updateDefenceProfile, 
    updateDefenceStatus,
    getRegistrationById,
    updateRegistrationById
} = require('../controllers/adminController');
const { protect, adminProtect } = require('../middlewares/authMiddleware');

router.use(protect, adminProtect); // Apply to all admin routes

router.get('/admin/dashboard', getDashboardStats);
router.get('/admin/registrations', getAllRegistrations);
router.get('/admin/registrations/:id', getRegistrationById);
router.put('/admin/registrations/:id', updateRegistrationById);
router.get('/admin/enquiries', getEnquiries);

// Defence specific admin routes
router.get('/defence-register/registrations', getDefenceRegistrations);
router.get('/defence-register/registrations/:id', getRegistrationById);
router.put('/defence-register/registrations/:id', updateRegistrationById);
router.put('/defence-register/profile', updateDefenceProfile);
router.put('/defence-register/registration/:id/status', updateDefenceStatus);

module.exports = router;
