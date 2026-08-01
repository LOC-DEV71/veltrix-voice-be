const ApiKey = require('../../models/apiKeyModel');
const User = require('../../models/userModel');
const Voice = require('../../models/voiceModel');
const AudioLog = require('../../models/audioLogModel');
const ClientTtsController = require('../client/ttsController');

class SdkController {
    // Middleware xác thực API Key từ Website tích hợp bên ngoài
    static async validateApiKey(req, res, next) {
        try {
            const apiKey = req.headers['x-api-key'] || req.query.apiKey || req.body?.apiKey;
            if (!apiKey) {
                return res.status(401).json({ error: "Thiếu API Key! Vui lòng cung cấp x-api-key header hoặc param apiKey." });
            }

            const keyDoc = await ApiKey.findOne({ key: apiKey }).populate('user');
            if (!keyDoc || !keyDoc.user) {
                return res.status(403).json({ error: "API Key không hợp lệ hoặc đã bị vô hiệu hóa!" });
            }

            if (keyDoc.user.status === 'INACTIVE') {
                return res.status(403).json({ error: "Tài khoản của bạn đang bị tạm khóa." });
            }

            // Cập nhật ngày sử dụng cuối
            keyDoc.lastUsedAt = new Date();
            await keyDoc.save();

            req.user = keyDoc.user;
            next();
        } catch (err) {
            return res.status(500).json({ error: "Xác thực API Key thất bại: " + err.message });
        }
    }

    // Lấy danh sách giọng đọc cho SDK Widget
    static async getVoices(req, res) {
        try {
            const voices = await Voice.find({ status: 'ACTIVE' }).sort({ isRecommended: -1, priority: -1, name: 1 });
            return res.json({ success: true, voices });
        } catch (err) {
            return res.status(500).json({ error: "Lỗi lấy danh sách giọng đọc: " + err.message });
        }
    }

    // Xem trước âm thanh SDK (Preview Blob)
    static async previewTTS(req, res) {
        return ClientTtsController.preview(req, res);
    }

    // Tạo Audio chính thức từ SDK
    static async generateTTS(req, res) {
        req.isSdkCall = true;
        return ClientTtsController.generate(req, res);
    }

    // Lấy lịch sử bài đọc đã tạo từ SDK
    static async getHistory(req, res) {
        try {
            const logs = await AudioLog.find({ user: req.user._id })
                .sort({ createdAt: -1 })
                .limit(20);
            return res.json({ success: true, history: logs });
        } catch (err) {
            return res.status(500).json({ error: "Lỗi lấy lịch sử audio: " + err.message });
        }
    }
}

module.exports = SdkController;
