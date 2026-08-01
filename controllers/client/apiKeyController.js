const ApiKey = require('../../models/apiKeyModel');
const crypto = require('crypto');

class ApiKeyController {
    // Lấy danh sách API Key của người dùng
    static async getApiKeys(req, res) {
        try {
            const apiKeys = await ApiKey.find({ user: req.user._id }).sort({ createdAt: -1 });
            return res.json({ success: true, apiKeys });
        } catch (err) {
            return res.status(500).json({ error: "Lỗi lấy danh sách API Key: " + err.message });
        }
    }

    // Tạo API Key mới
    static async createApiKey(req, res) {
        try {
            const { name } = req.body;
            const randomBytes = crypto.randomBytes(16).toString('hex');
            const key = `vk_live_${randomBytes}`;

            const newKey = await ApiKey.create({
                user: req.user._id,
                name: name && name.trim() ? name.trim() : 'Veltrix Voice Widget Key',
                key
            });

            return res.status(201).json({ success: true, apiKey: newKey, message: "Tạo API Key mới thành công" });
        } catch (err) {
            return res.status(500).json({ error: "Lỗi tạo API Key: " + err.message });
        }
    }

    // Xóa API Key
    static async deleteApiKey(req, res) {
        try {
            const { id } = req.params;
            await ApiKey.findOneAndDelete({ _id: id, user: req.user._id });
            return res.json({ success: true, message: "Đã xóa API Key thành công" });
        } catch (err) {
            return res.status(500).json({ error: "Lỗi xóa API Key: " + err.message });
        }
    }
}

module.exports = ApiKeyController;
