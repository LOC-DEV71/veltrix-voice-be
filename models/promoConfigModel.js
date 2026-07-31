const mongoose = require('mongoose');

const promoConfigSchema = new mongoose.Schema({
    title: {
        type: String,
        default: 'Sự Kiện Quảng Bá Mạng Xã Hội'
    },
    platformName: {
        type: String,
        default: 'TikTok'
    },
    applicablePlans: [{
        type: String // Các mã gói áp dụng: 'BASIC', 'CREATOR', 'PRO'... (Nếu trống = áp dụng cho tất cả gói)
    }],
    promoImageUrl: {
        type: String,
        default: ''
    },
    hashtags: [{
        type: String
    }],
    instructions: {
        type: String,
        default: ''
    },
    instructionsEn: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('PromoConfig', promoConfigSchema);
