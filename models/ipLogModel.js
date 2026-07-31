const mongoose = require('mongoose');

const ipLogSchema = new mongoose.Schema({
    ipAddress: {
        type: String,
        required: true,
        index: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    email: {
        type: String,
        default: ''
    },
    action: {
        type: String,
        enum: ['REGISTER', 'LOGIN', 'GOOGLE_LOGIN', 'TTS_GENERATE', 'CONSENT_IP'],
        required: true
    },
    userAgent: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Index tìm kiếm IP nhanh cho thuật toán chặn gian lận
ipLogSchema.index({ ipAddress: 1, createdAt: -1 });

module.exports = mongoose.model('IpLog', ipLogSchema);
