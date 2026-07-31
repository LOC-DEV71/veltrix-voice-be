const mongoose = require('mongoose');

const voiceSchema = new mongoose.Schema({
    voiceId: {
        type: String,
        required: [true, 'Vui lòng nhập ID giọng đọc (ví dụ: vi-VN-HoaiMyNeural)'],
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: [true, 'Vui lòng nhập tên giọng đọc hiển thị'],
        trim: true
    },
    gender: {
        type: String,
        enum: ['Nữ', 'Nam'],
        default: 'Nữ'
    },
    region: {
        type: String,
        default: 'Miền Bắc'
    },
    language: {
        type: String,
        default: 'vi-VN'
    },
    provider: {
        type: String,
        default: 'Microsoft Neural'
    },
    badge: {
        type: String,
        default: ''
    },
    desc: {
        type: String,
        default: ''
    },
    sampleText: {
        type: String,
        default: 'Xin chào, đây là giọng đọc thử nghiệm của tôi trên Veltrix Voice.'
    },
    requiredRole: {
        type: String,
        default: 'FREE' // Lưu Mã Gói Cước Động từ MongoDB (FREE, PRO, CREATOR, BUSINESS, VIP...)
    },
    sampleAudioUrl: {
        type: String,
        default: ''
    },
    isVipOnly: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE'],
        default: 'ACTIVE'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Voice', voiceSchema);
