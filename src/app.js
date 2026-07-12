const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors()); // Allow all origins for development
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Default Route
app.get('/', (req, res) => {
    res.send('Science Champ API is running...');
});

const authRoutes = require('./routes/authRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const studentRoutes = require('./routes/studentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const enquiryRoutes = require('./routes/enquiryRoutes');
const resultRoutes = require('./routes/resultRoutes');

app.use('/api/v1', authRoutes);
app.use('/api/v1', registrationRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/student', studentRoutes);
app.use('/api/v1', adminRoutes); // adminRoutes contains /admin and /defence-register base paths internally
app.use('/api/v1/enquiry', enquiryRoutes);
app.use('/api/v1/result', resultRoutes);

module.exports = app;
