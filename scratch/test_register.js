require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/userModel');
const { sendEmail } = require('../utils/emailService');

async function testRegister() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🍃 DB Connected!');

        const testEmail = 'test_register_' + Date.now() + '@gmail.com';
        console.log('📝 Registering test email:', testEmail);

        const verificationToken = 'test_token_123';
        const confirmUrl = `http://localhost:5173/confirm?token=${verificationToken}`;

        const newUser = await User.create({
            name: 'Test User',
            email: testEmail,
            password: 'TestPassword123!',
            tokens: 2000,
            dailyTokenLimit: 2000,
            isVerified: false,
            verificationToken,
            verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
        });

        console.log('✅ User created in DB:', newUser._id);

        console.log('📧 Attempting sendEmail...');
        const info = await sendEmail({
            to: newUser.email,
            subject: 'Xác Nhận Kích Hoạt Tài Khoản Veltrix Voice 🚀',
            title: 'XÁC NHẬN TÀI KHOẢN',
            category: 'XÁC THỰC EMAIL TÀI KHOẢN',
            greeting: `Xin chào ${newUser.name},`,
            messageHtml: 'Cảm ơn bạn đã đăng ký tài khoản tại <b>Veltrix Voice</b>.',
            actionText: '✅ XÁC NHẬN TÀI KHOẢN NGAY',
            actionUrl: confirmUrl,
            footerNote: 'Liên kết xác thực có hiệu lực trong 24 giờ.'
        });

        console.log('🎉 SendEmail succeeded:', info);

        // Clean up test user
        await User.findByIdAndDelete(newUser._id);
        console.log('🧹 Cleaned up test user');

    } catch (err) {
        console.error('❌ Registration test error:', err);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

testRegister();
