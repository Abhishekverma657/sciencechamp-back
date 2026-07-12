require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./src/models/Admin');

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const email = 'admin@sciencechamp.in';
        const password = 'ScienceChamp@2026'; // Medium complexity password

        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            console.log('Admin already exists.');
        } else {
            const admin = new Admin({ email, password });
            await admin.save();
            console.log('Admin user created successfully!');
            console.log(`Email: ${email}`);
            console.log(`Password: ${password}`);
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

seedAdmin();
