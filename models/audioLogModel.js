const mongoose = require('mongoose');

const audioLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    text: {
        type: String,
        required: true
    },
    voiceId: {
        type: String,
        required: true
    },
    audioUrl: {
        type: String,
        default: ''
    },
    charactersCount: {
        type: Number,
        required: true
    },
    tokensDeducted: {
        type: Number,
        required: true
    },
    ipAddress: {
        type: String,
        default: ''
    },
    title: {
        type: String,
        default: ''
    },
    folder: {
        type: String,
        default: 'Mặc định'
    }
}, {
    timestamps: true
});

// Index tối ưu tải trang lịch sử audio siêu tốc khi dữ liệu lớn
audioLogSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('AudioLog', audioLogSchema);
