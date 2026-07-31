require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/userModel');
const DeviceAuth = require('../models/deviceAuthModel');
const { validateEmail } = require('../utils/emailValidator');
const { validatePassword } = require('../utils/passwordValidator');

async function auditAllCases() {
    console.log('----------------------------------------------------');
    console.log('🧪 BẮT ĐẦU AUDIT CHI TIẾT TỪNG TÍNH NĂNG BẢO MẬT');
    console.log('----------------------------------------------------\n');

    // 1. Audit Email Validator
    console.log('📌 1. Kiểm tra Email Validator (emailValidator.js):');
    const emailTests = [
        { email: 'invalid-email', expected: false },
        { email: 'user@', expected: false },
        { email: 'user@domain', expected: false },
        { email: 'valid.user@gmail.com', expected: true }
    ];
    emailTests.forEach(t => {
        const res = validateEmail(t.email);
        const pass = res.isValid === t.expected;
        console.log(`   - Email "${t.email}": ${res.isValid ? 'Hợp lệ' : 'Không hợp lệ (' + res.message + ')'} => ${pass ? '✅ PASS' : '❌ FAIL'}`);
    });

    // 2. Audit Password Validator
    console.log('\n📌 2. Kiểm tra Password Validator (passwordValidator.js):');
    const passTests = [
        { pass: 'short', expected: false },
        { pass: 'no-uppercase1!', expected: false },
        { pass: 'NoNumber!', expected: false },
        { pass: 'NoSpecial123', expected: false },
        { pass: 'ValidPass123!', expected: true }
    ];
    passTests.forEach(t => {
        const res = validatePassword(t.pass);
        const pass = res.isValid === t.expected;
        console.log(`   - Password "${t.pass}": ${res.isValid ? 'Hợp lệ' : 'Không hợp lệ (' + res.message + ')'} => ${pass ? '✅ PASS' : '❌ FAIL'}`);
    });

    // 3. Database & Authentication Checks
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('\n🍃 DB Connected!');

        // Audit Email không tồn tại
        const nonExistentEmail = 'non_existent_' + Date.now() + '@example.com';
        const dummyUser = await User.findOne({ email: nonExistentEmail });
        console.log(`\n📌 3. Kiểm tra tìm Email không tồn tại ("${nonExistentEmail}"):`);
        console.log(`   - Kết quả DB tìm thấy: ${dummyUser ? 'Có' : 'Không (null)'} => ${!dummyUser ? '✅ PASS (Server sẽ trả ra 404 Email chưa được đăng ký)' : '❌ FAIL'}`);

        // Audit Mật khẩu không chính xác
        const testEmail = 'audit_test_user_' + Date.now() + '@gmail.com';
        const realPassword = 'CorrectPass123!';
        const wrongPassword = 'WrongPass123!';

        const createdUser = await User.create({
            name: 'Audit User',
            email: testEmail,
            password: realPassword,
            tokens: 2000,
            dailyTokenLimit: 2000,
            isVerified: true
        });

        const isMatchReal = await createdUser.comparePassword(realPassword);
        const isMatchWrong = await createdUser.comparePassword(wrongPassword);

        console.log('\n📌 4. Kiểm tra So Sánh Mật Khẩu (comparePassword):');
        console.log(`   - Thử MK Đúng ("${realPassword}"): ${isMatchReal ? 'Khớp ✅ PASS' : 'Không khớp ❌ FAIL'}`);
        console.log(`   - Thử MK Sai ("${wrongPassword}"): ${!isMatchWrong ? 'Không Khớp ✅ PASS (Server sẽ trả ra 401 Mật khẩu không chính xác)' : 'Khớp ❌ FAIL'}`);

        // Clean up
        await User.findByIdAndDelete(createdUser._id);
        console.log('\n🧹 Dọn dẹp dữ liệu test thành công!');

    } catch (err) {
        console.error('❌ Audit DB Error:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n----------------------------------------------------');
        console.log('✅ KẾT THÚC AUDIT HỆ THỐNG');
        console.log('----------------------------------------------------');
        process.exit();
    }
}

auditAllCases();
