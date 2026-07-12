const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    studentName: { type: String, required: true },
    fatherName: { type: String },
    motherName: { type: String },
    fatherMobile: { type: String },
    class: { type: String, required: true },
    stream: { type: String },
    schoolName: { type: String },
    state: { type: String },
    city: { type: String },
    dob: { type: Date },
    gender: { type: String },
    address: { type: String },
    pincode: { type: String },
    examCenter: { type: String },
    status: { type: String, default: 'pending' }, // pending, completed
    type: { type: String, default: 'standard' } // standard, defence
}, { timestamps: true });

module.exports = mongoose.model('Registration', registrationSchema);
