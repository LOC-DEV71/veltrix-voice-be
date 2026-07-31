require('dotenv').config();
const mongoose = require('mongoose');
const Setting = require('../models/settingModel');
const { sendEmail } = require('../utils/emailService');

async function testEmail() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🍃 DB Connected!');

        const setting = await Setting.findOne();
        console.log('⚙️ DB Settings:', {
            smtpUser: setting?.smtpUser,
            hasPass: !!setting?.smtpPass,
            smtpHost: setting?.smtpHost,
            smtpPort: setting?.smtpPort
        });

        console.log('📧 Testing sendEmail...');
        const info = await sendEmail({
            to: 'test@example.com',
            subject: 'Test Email Veltrix',
            title: 'TEST EMAIL',
            category: 'TEST',
            greeting: 'Xin chào',
            messageHtml: 'Email test thành công!'
        });
        console.log('✅ SendEmail Success:', info);
    } catch (err) {
        console.error('❌ SendEmail Error:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

testEmail();
