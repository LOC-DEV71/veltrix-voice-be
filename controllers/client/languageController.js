const Language = require('../../models/languageModel');

class ClientLanguageController {
    static async getLanguages(req, res) {
        try {
            const languages = await Language.find({ isActive: true }).select('code name isDefault').sort({ isDefault: -1 });
            return res.json({ languages });
        } catch (error) {
            console.error("Lỗi lấy danh sách ngôn ngữ:", error);
            return res.status(500).json({ error: "Lỗi tải ngôn ngữ: " + error.message });
        }
    }
}

module.exports = ClientLanguageController;
