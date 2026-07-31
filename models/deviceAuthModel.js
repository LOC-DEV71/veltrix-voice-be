const mongoose = require('mongoose');

const deviceAuthSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    ipAddress: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        default: ''
    },
    securityCode: {
        type: String, // Số 2 chữ số ví dụ: "48"
        required: true
    },
    optionCodes: [{
        type: String // Danh sách 3 lựa chọn trên Email ví dụ: ["12", "48", "95"]
    }],
    sessionToken: {
        type: String, // Token session cho thiết bị mới dùng Polling kiểm tra
        required: true,
        unique: true
    },
    verifyToken: {
        type: String, // Token đính kèm trong Email link (/device-verify?token=...)
        required: true,
        unique: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date,
        required: true // Hiệu lực 10 phút
    }
}, {
    timestamps: true
});

// Auto TTL Index xóa các bản ghi hết hạn sau 30 phút
deviceAuthSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 1800 });

module.exports = mongoose.model('DeviceAuth', deviceAuthSchema);
