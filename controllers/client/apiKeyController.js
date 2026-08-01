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
            const { name, allowedDomains } = req.body;
            const randomBytes = crypto.randomBytes(16).toString('hex');
            const key = `vk_live_${randomBytes}`;

            let domains = [];
            if (Array.isArray(allowedDomains)) {
                domains = allowedDomains.map(d => d.trim()).filter(Boolean);
            } else if (typeof allowedDomains === 'string') {
                domains = allowedDomains.split(',').map(d => d.trim()).filter(Boolean);
            }

            const newKey = await ApiKey.create({
                user: req.user._id,
                name: name && name.trim() ? name.trim() : 'Veltrix Voice Widget Key',
                key,
                allowedDomains: domains
            });

            return res.status(201).json({ success: true, apiKey: newKey, message: "Tạo API Key mới thành công" });
        } catch (err) {
            return res.status(500).json({ error: "Lỗi tạo API Key: " + err.message });
        }
    }

    // Cập nhật cấu hình API Key (Tên & Tên miền bảo mật)
    static async updateApiKey(req, res) {
        try {
            const { id } = req.params;
            const { name, allowedDomains } = req.body;

            const apiKeyDoc = await ApiKey.findOne({ _id: id, user: req.user._id });
            if (!apiKeyDoc) {
                return res.status(404).json({ error: "Không tìm thấy API Key!" });
            }

            if (name !== undefined) {
                apiKeyDoc.name = name.trim() || apiKeyDoc.name;
            }

            if (allowedDomains !== undefined) {
                let domains = [];
                if (Array.isArray(allowedDomains)) {
                    domains = allowedDomains.map(d => d.trim()).filter(Boolean);
                } else if (typeof allowedDomains === 'string') {
                    domains = allowedDomains.split(',').map(d => d.trim()).filter(Boolean);
                }
                apiKeyDoc.allowedDomains = domains;
            }

            await apiKeyDoc.save();
            return res.json({ success: true, apiKey: apiKeyDoc, message: "Cập nhật cấu hình API Key thành công" });
        } catch (err) {
            return res.status(500).json({ error: "Lỗi cập nhật API Key: " + err.message });
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
