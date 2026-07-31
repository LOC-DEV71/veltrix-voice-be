const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    plan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan'
    },
    transactionCode: {
        type: String,
        required: true,
        unique: true
    },
    planName: {
        type: String,
        required: true
    },
    tier: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true,
        default: 0
    },
    priceFormatted: {
        type: String,
        default: '0 VNĐ'
    },
    tokensGranted: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['PAYPAL', 'VNPAY', 'BANK_TRANSFER', 'SYSTEM_PROMO', 'FREE_TRIAL'],
        default: 'FREE_TRIAL'
    },
    status: {
        type: String,
        enum: ['COMPLETED', 'PENDING', 'FAILED', 'CANCELLED'],
        default: 'COMPLETED',
        index: true
    },
    ipAddress: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Index tối ưu hóa truy vấn khi data lên tới hàng triệu bản ghi
transactionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
