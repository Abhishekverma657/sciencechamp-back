const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    studentName: { type: String },
    rollNumber: { type: String, required: true, unique: true },
    marks: { type: Number },
    rank: { type: Number },
    remarks: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Result', resultSchema);
