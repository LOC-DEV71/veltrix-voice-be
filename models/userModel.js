const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vui lòng nhập tên người dùng'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Vui lòng nhập Email'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Vui lòng nhập mật khẩu'],
        minlength: 6
    },
    tier: {
        type: String,
        enum: ['FREE', 'BASIC', 'CREATOR', 'PRO', 'VIP', 'CUSTOM'],
        default: 'FREE'
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE'],
        default: 'ACTIVE'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String,
        default: null
    },
    verificationTokenExpires: {
        type: Date,
        default: null
    },
    tokens: {
        type: Number,
        default: 2000
    },
    dailyTokenLimit: {
        type: Number,
        default: 2000 // Tối đa 2,000 ký tự mỗi ngày
    },
    dailyTokensUsed: {
        type: Number,
        default: 0
    },
    lastDailyResetDate: {
        type: String,
        default: () => new Date().toISOString().split('T')[0] // Ngày làm mới 00:00 (YYYY-MM-DD)
    },
    maxCharsPerRequest: {
        type: Number,
        default: 1000
    },
    planExpiresAt: {
        type: Date,
        default: null
    },
    lastLoginIp: {
        type: String,
        default: ''
    },
    trustedIps: [{
        type: String
    }],
    subscriptionHistory: [{
        planName: { type: String, required: true },
        tier: { type: String, required: true },
        tokensGranted: { type: Number, required: true },
        price: { type: String, default: '0 VNĐ' },
        createdAt: { type: Date, default: Date.now },
        expiresAt: { type: Date },
        status: { type: String, default: 'Hoàn thành' }
    }]
}, {
    timestamps: true
});

userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
