const Enquiry = require('../models/Enquiry');

// @desc    Submit Enquiry
// @route   POST /api/v1/enquiry
// @access  Public
const submitEnquiry = async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        
        const enquiry = await Enquiry.create({
            name,
            email,
            phone,
            message
        });

        res.json({ success: true, data: enquiry, message: 'Enquiry submitted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { submitEnquiry };
