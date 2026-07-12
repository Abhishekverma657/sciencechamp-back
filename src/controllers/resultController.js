const Result = require('../models/Result');
const User = require('../models/User');

// @desc    Upload Result (Admin)
// @route   POST /api/v1/result/admin/upload
// @access  Private/Admin
const uploadResult = async (req, res) => {
    try {
        // Assume req.body contains an array of results or single result object
        const resultData = req.body;
        // In a real scenario, this might parse CSV. For now, just save.
        
        if (Array.isArray(resultData)) {
            await Result.insertMany(resultData);
        } else {
            await Result.create(resultData);
        }

        res.json({ success: true, message: 'Result(s) uploaded successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get All Results (Admin)
// @route   GET /api/v1/result/admin/all
// @access  Private/Admin
const getAllResults = async (req, res) => {
    try {
        const results = await Result.find();
        res.json({ success: true, data: results });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get My Result (Student)
// @route   GET /api/v1/result/my-result
// @access  Private
const getMyResult = async (req, res) => {
    try {
        // Assuming result uses rollNumber or phone linking. 
        // We will try finding by linked User ID.
        const result = await Result.findOne({ userId: req.user.id });
        if (!result) {
            return res.status(404).json({ success: false, message: 'Result not found' });
        }
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    uploadResult,
    getAllResults,
    getMyResult
};
