const Registration = require('../models/Registration');
const User = require('../models/User');

// @desc    Step 1 Registration
// @route   POST /api/v1/register/step1
// @access  Public
const registerStep1 = async (req, res) => {
    try {
        const { 
            name, 
            studentClass, 
            registration_uuid, 
            email,
            father_name,
            father_mobile_number,
            school_name,
            state,
            city,
            dob,
            stream,
            exam_center 
        } = req.body;
        
        const phone = registration_uuid;

        if (!phone) {
            return res.status(400).json({ success: false, message: 'Phone/Registration UUID is required' });
        }

        // Find or create user
        let user = await User.findOne({ phone });
        if (!user) {
            user = await User.create({ phone, name, email });
        } else {
            // Update email if it's missing
            if (email && !user.email) {
                user.email = email;
                await user.save();
            }
        }

        const registration = await Registration.create({
            userId: user._id,
            studentName: name,
            fatherName: father_name,
            fatherMobile: father_mobile_number,
            class: studentClass,
            stream: stream,
            schoolName: school_name,
            state,
            city,
            dob,
            examCenter: exam_center,
            type: 'standard',
        });

        res.json({ success: true, data: registration });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Defence Registration
// @route   POST /api/v1/defence-register/register
// @access  Public
const defenceRegister = async (req, res) => {
    try {
        const { 
            name, 
            studentClass, 
            registration_uuid, 
            email,
            father_name,
            father_mobile_number,
            school_name,
            state,
            city,
            dob,
            stream,
            exam_center,
            ...otherDetails 
        } = req.body;
        
        const phone = registration_uuid;

        if (!phone) {
            return res.status(400).json({ success: false, message: 'Phone/Registration UUID is required' });
        }
        
        let user = await User.findOne({ phone });
        if (!user) {
            user = await User.create({ phone, name, email });
        }

        const registration = await Registration.create({
            userId: user._id,
            studentName: name,
            fatherName: father_name,
            fatherMobile: father_mobile_number,
            class: studentClass,
            stream: stream,
            schoolName: school_name,
            state,
            city,
            dob,
            examCenter: exam_center,
            type: 'defence',
            ...otherDetails
        });

        res.json({ success: true, data: registration });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get states list
// @route   GET /api/v1/states
// @access  Public
const getStates = async (req, res) => {
    const states = [
        { id: 1, name: "Andhra Pradesh", code: "AP" },
        { id: 2, name: "Arunachal Pradesh", code: "AR" },
        { id: 3, name: "Assam", code: "AS" },
        { id: 4, name: "Bihar", code: "BR" },
        { id: 5, name: "Chhattisgarh", code: "CG" },
        { id: 6, name: "Goa", code: "GA" },
        { id: 7, name: "Gujarat", code: "GJ" },
        { id: 8, name: "Haryana", code: "HR" },
        { id: 9, name: "Himachal Pradesh", code: "HP" },
        { id: 10, name: "Jharkhand", code: "JH" },
        { id: 11, name: "Karnataka", code: "KA" },
        { id: 12, name: "Kerala", code: "KL" },
        { id: 13, name: "Madhya Pradesh", code: "MP" },
        { id: 14, name: "Maharashtra", code: "MH" },
        { id: 15, name: "Manipur", code: "MN" },
        { id: 16, name: "Meghalaya", code: "ML" },
        { id: 17, name: "Mizoram", code: "MZ" },
        { id: 18, name: "Nagaland", code: "NL" },
        { id: 19, name: "Odisha", code: "OR" },
        { id: 20, name: "Punjab", code: "PB" },
        { id: 21, name: "Rajasthan", code: "RJ" },
        { id: 22, name: "Sikkim", code: "SK" },
        { id: 23, name: "Tamil Nadu", code: "TN" },
        { id: 24, name: "Telangana", code: "TG" },
        { id: 25, name: "Tripura", code: "TR" },
        { id: 26, name: "Uttar Pradesh", code: "UP" },
        { id: 27, name: "Uttarakhand", code: "UK" },
        { id: 28, name: "West Bengal", code: "WB" }
    ];
    res.json({ success: true, data: states });
};

// @desc    Get Registration details (Student)
// @route   GET /api/v1/register/registration
// @access  Private
const getRegistration = async (req, res) => {
    try {
        const registration = await Registration.findOne({ userId: req.user.id });
        if (!registration) {
            return res.status(404).json({ success: false, message: "Registration not found" });
        }
        res.json({ success: true, data: registration });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update Registration details
// @route   PUT /api/v1/register/registration
// @access  Private
const updateRegistration = async (req, res) => {
    try {
        const registration = await Registration.findOneAndUpdate(
            { userId: req.user.id },
            req.body,
            { new: true }
        );
        res.json({ success: true, data: registration });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    registerStep1,
    defenceRegister,
    getStates,
    getRegistration,
    updateRegistration
};
