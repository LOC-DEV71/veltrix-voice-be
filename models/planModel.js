const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vui lòng nhập tên gói dịch vụ'],
        trim: true
    },
    nameEn: {
        type: String,
        trim: true
    },
    code: {
        type: String,
        required: [true, 'Vui lòng nhập mã gói (Mã định danh)'],
        unique: true,
        uppercase: true,
        trim: true
    },
    monthlyPrice: {
        type: Number,
        default: 0
    },
    yearlyPrice: {
        type: Number,
        default: 0
    },
    monthlyPriceVND: {
        type: Number,
        default: 0
    },
    yearlyPriceVND: {
        type: Number,
        default: 0
    },
    tokenText: {
        type: String,
        required: [true, 'Vui lòng nhập hiển thị Token (VD: 200K token/tháng)']
    },
    tokenTextEn: {
        type: String
    },
    tokensPerMonth: {
        type: Number,
        default: 0
    },
    maxCharsPerRequest: {
        type: Number,
        default: 1000
    },
    features: [{
        type: String
    }],
    featuresEn: [{
        type: String
    }],
    isFeatured: {
        type: Boolean,
        default: false
    },
    isPopular: {
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

module.exports = mongoose.model('Plan', planSchema);
