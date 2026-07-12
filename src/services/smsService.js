const axios = require('axios');

async function sendSmsOTP(phone) {
    try {
        // 1. Clean the phone number (remove any non-digit characters)
        const cleanPhone = String(phone).replace(/\D/g, '');

        if (!cleanPhone) {
            throw new Error('Valid phone number is required');
        }

        // 2. Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // 3. Prepare the SMS Message (Must match the approved DLT template exactly)
        const message = `Dear User Your OTP is ${otp} for mobile number verification. It is valid for 5 minutes. Please do not share with anyone - CSOCIT`;
        
        // 4. URL Encode the message
        const encodedMsg = encodeURIComponent(message);

        // 5. Construct the API URL using the key from env or fallback to provided one
        const apiKey = process.env.SMS_API_KEY || '563C78DD92E750';
        const url = `https://login.bulksenders.in/app/smsapi/index.php?key=${apiKey}&campaign=12417&routeid=3&type=text&contacts=${cleanPhone}&senderid=CSOCIT&msg=${encodedMsg}&template_id=1707173399550602618&pe_id=1701171048184684059`;

        // 6. Send the SMS via Axios
        const response = await axios.get(url);
        
        console.log(`[SMS OTP] Success for ${cleanPhone}: OTP is ${otp}`);
        
        // Return the generated OTP so it can be saved in DB
        return {
            success: true,
            message: 'OTP sent successfully',
            otp: otp
        };

    } catch (error) {
        console.error(`[SMS OTP] Error:`, error.message);
        throw new Error("Failed to send SMS OTP");
    }
}

module.exports = { sendSmsOTP };
