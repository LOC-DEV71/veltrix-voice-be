const Language = require('../../models/languageModel');

const DEFAULT_LANGUAGES = [
    { code: 'vi', name: 'Tiếng Việt 🇻🇳', isDefault: true, isActive: true },
    { code: 'en', name: 'English 🇬🇧', isDefault: false, isActive: true },
    { code: 'ja', name: '日本語 (Tiếng Nhật) 🇯🇵', isDefault: false, isActive: true },
    { code: 'ko', name: '한국어 (Tiếng Hàn) 🇰🇷', isDefault: false, isActive: true },
    { code: 'zh', name: '中文 (Tiếng Trung) 🇨🇳', isDefault: false, isActive: true },
    { code: 'fr', name: 'Français (Tiếng Pháp) 🇫🇷', isDefault: false, isActive: true }
];

class ClientLanguageController {
    static async getLanguages(req, res) {
        try {
            let languages = await Language.find({ isActive: true }).select('code name isDefault').sort({ isDefault: -1, createdAt: 1 });
            
            // Nếu DB chưa có ngôn ngữ nào, tự động seed 6 ngôn ngữ mặc định
            if (!languages || languages.length === 0) {
                await Language.insertMany(DEFAULT_LANGUAGES);
                languages = await Language.find({ isActive: true }).select('code name isDefault').sort({ isDefault: -1, createdAt: 1 });
            }

            return res.json({ success: true, languages });
        } catch (error) {
            console.error("Lỗi lấy danh sách ngôn ngữ client:", error);
            return res.status(500).json({ error: "Lỗi tải ngôn ngữ: " + error.message });
        }
    }
}

module.exports = ClientLanguageController;
