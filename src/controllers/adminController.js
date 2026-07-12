const Registration = require('../models/Registration');
const Enquiry = require('../models/Enquiry');
const Payment = require('../models/Payment');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/v1/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        const total_students = await Registration.countDocuments();
        const total_enquiries = await Enquiry.countDocuments();
        const otp_verified = await Registration.countDocuments({ status: 'pending' });
        const completed = await Registration.countDocuments({ status: 'completed' });
        
        // Fetch recent registrations
        const recentRegDb = await Registration.find().sort({ createdAt: -1 }).limit(5).populate('userId');
        const recent_registrations = recentRegDb.map(r => ({
            id: r._id,
            name: r.studentName,
            email: r.userId?.email || null,
            mobile_number: r.userId?.phone || 'N/A',
            status: r.status,
            created_at: r.createdAt
        }));

        // Fetch recent enquiries
        const recentEnqDb = await Enquiry.find().sort({ createdAt: -1 }).limit(5);
        const recent_enquiries = recentEnqDb.map(e => ({
            id: e._id,
            name: e.name,
            email: e.email,
            mobile_number: e.phone,
            city: 'N/A', // City might not be available in enquiry
            created_at: e.createdAt
        }));

        res.json({
            success: true,
            data: {
                total_students,
                total_enquiries,
                status_stats: {
                    otp_verified,
                    completed,
                    payment_pending: otp_verified, // mapped pending to payment pending
                    payment_failed: 0 // Optional placeholder
                },
                recent_registrations,
                recent_enquiries
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get All Registrations
// @route   GET /api/v1/admin/registrations
// @access  Private/Admin
const getAllRegistrations = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        let query = { type: 'standard' };

        // Basic filtering support
        if (req.query.city) query.city = new RegExp(req.query.city, 'i');
        if (req.query.state) query.state = new RegExp(req.query.state, 'i');
        if (req.query.class) query.class = req.query.class;

        const totalRecords = await Registration.countDocuments(query);
        const registrationsDb = await Registration.find(query)
            .populate('userId')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        // Map to frontend expected format
        const registrations = registrationsDb.map(reg => ({
            id: reg._id,
            roll_number: reg.userId?.phone || 'N/A', // Using phone as roll number placeholder
            name: reg.studentName,
            mobile_number: reg.userId?.phone || 'N/A',
            email: reg.userId?.email || 'N/A',
            status: reg.status,
            dob: reg.dob,
            state: reg.state,
            city: reg.city,
            class: reg.class,
            stream: reg.stream || 'N/A'
        }));

        res.json({ 
            success: true, 
            data: {
                registrations,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalRecords / limit),
                    totalRecords,
                    limit,
                    hasNextPage: page < Math.ceil(totalRecords / limit),
                    hasPrevPage: page > 1
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get All Enquiries
// @route   GET /api/v1/admin/enquiries
// @access  Private/Admin
const getEnquiries = async (req, res) => {
    try {
        const enquiries = await Enquiry.find().sort('-createdAt');
        res.json({ success: true, data: enquiries });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get Defence Registrations
// @route   GET /api/v1/defence-register/registrations
// @access  Private/Admin
const getDefenceRegistrations = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        let query = { type: 'defence' };

        if (req.query.city) query.city = new RegExp(req.query.city, 'i');
        if (req.query.state) query.state = new RegExp(req.query.state, 'i');
        if (req.query.class) query.class = req.query.class;

        const totalRecords = await Registration.countDocuments(query);
        const registrationsDb = await Registration.find(query)
            .populate('userId')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const registrations = registrationsDb.map(reg => ({
            id: reg._id,
            roll_number: reg.userId?.phone || 'N/A',
            name: reg.studentName,
            mobile_number: reg.userId?.phone || 'N/A',
            email: reg.userId?.email || 'N/A',
            status: reg.status,
            dob: reg.dob,
            state: reg.state,
            city: reg.city,
            class: reg.class,
            stream: reg.stream || 'N/A'
        }));

        res.json({ 
            success: true, 
            data: {
                registrations,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalRecords / limit),
                    totalRecords,
                    limit,
                    hasNextPage: page < Math.ceil(totalRecords / limit),
                    hasPrevPage: page > 1
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update Defence Profile
// @route   PUT /api/v1/defence-register/profile
// @access  Private/Admin
const updateDefenceProfile = async (req, res) => {
    try {
        // Assume req.body contains the updated profile details and registration ID
        const { id, ...updateData } = req.body;
        const updated = await Registration.findByIdAndUpdate(id, updateData, { new: true });
        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update Defence Registration Status
// @route   PUT /api/v1/defence-register/registration/:id/status
// @access  Private/Admin
const updateDefenceStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updated = await Registration.findByIdAndUpdate(id, { status }, { new: true });
        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get Registration By ID
// @route   GET /api/v1/admin/registrations/:id
// @access  Private/Admin
const getRegistrationById = async (req, res) => {
    try {
        const { id } = req.params;
        const reg = await Registration.findById(id).populate('userId');
        
        if (!reg) {
            return res.status(404).json({ success: false, message: 'Registration not found' });
        }

        // Fetch associated payment
        const paymentDb = await Payment.findOne({ registrationId: reg._id }).sort({ createdAt: -1 });

        let payment = null;
        if (paymentDb) {
            payment = {
                status: paymentDb.status,
                amount: paymentDb.amount,
                transaction_id: paymentDb.razorpayPaymentId || paymentDb.razorpayOrderId,
                paid_at: paymentDb.updatedAt
            };
        }

        const formattedReg = {
            id: reg._id,
            roll_number: reg.userId?.phone || 'N/A',
            name: reg.studentName,
            mobile_number: reg.userId?.phone || 'N/A',
            email: reg.userId?.email || 'N/A',
            father_name: reg.fatherName,
            father_mobile_number: reg.fatherMobile,
            school_name: reg.schoolName,
            class: reg.class,
            exam_center: reg.examCenter,
            stream: reg.stream,
            state: reg.state,
            city: reg.city,
            status: reg.status,
            dob: reg.dob,
            created_at: reg.createdAt,
            payment: payment
        };

        res.json({ success: true, data: formattedReg });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update Registration By ID
// @route   PUT /api/v1/admin/registrations/:id
// @access  Private/Admin
const updateRegistrationById = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const reg = await Registration.findById(id).populate('userId');
        if (!reg) {
            return res.status(404).json({ success: false, message: 'Registration not found' });
        }

        // Update Registration fields
        if (updateData.name) reg.studentName = updateData.name;
        if (updateData.father_name) reg.fatherName = updateData.father_name;
        if (updateData.father_mobile_number) reg.fatherMobile = updateData.father_mobile_number;
        if (updateData.class) reg.class = updateData.class;
        if (updateData.stream) reg.stream = updateData.stream;
        if (updateData.school_name) reg.schoolName = updateData.school_name;
        if (updateData.state) reg.state = updateData.state;
        if (updateData.city) reg.city = updateData.city;
        if (updateData.exam_center) reg.examCenter = updateData.exam_center;
        if (updateData.dob) reg.dob = updateData.dob;
        
        await reg.save();

        // Update User (Student) fields
        if (reg.userId && (updateData.mobile_number || updateData.email)) {
            const User = require('../models/User');
            const user = await User.findById(reg.userId._id);
            if (user) {
                if (updateData.mobile_number) user.phone = updateData.mobile_number;
                if (updateData.email) user.email = updateData.email;
                await user.save();
            }
        }

        res.json({ success: true, message: 'Registration updated successfully', data: reg });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getDashboardStats,
    getAllRegistrations,
    getEnquiries,
    getDefenceRegistrations,
    updateDefenceProfile,
    updateDefenceStatus,
    getRegistrationById,
    updateRegistrationById
};
