const mongoose = require('mongoose');

const tiktokPromoSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    plan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan',
        required: true
    },
    planCode: {
        type: String,
        required: true
    },
    planName: {
        type: String,
        required: true
    },
    tiktokUrl: {
        type: String,
        required: [true, 'Vui lòng dán link video TikTok'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Vui lòng nhập email'],
        lowercase: true,
        trim: true
    },
    promoImageUrl: {
        type: String,
        default: ''
    },
    hashtags: [{
        type: String
    }],
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING',
        index: true
    },
    adminNote: {
        type: String,
        default: ''
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account'
    },
    approvedAt: {
        type: Date
    }
}, {
    timestamps: true
});

tiktokPromoSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('TiktokPromo', tiktokPromoSchema);
