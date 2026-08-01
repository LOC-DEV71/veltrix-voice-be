const Language = require('../../models/languageModel');

const DEFAULT_LANGUAGES = [
    { code: 'vi', name: 'Tiếng Việt 🇻🇳', isDefault: true, isActive: true },
    { code: 'en', name: 'English 🇬🇧', isDefault: false, isActive: true },
    { code: 'ja', name: '日本語 (Tiếng Nhật) 🇯🇵', isDefault: false, isActive: true },
    { code: 'ko', name: '한국어 (Tiếng Hàn) 🇰🇷', isDefault: false, isActive: true },
    { code: 'zh', name: '中文 (Tiếng Trung) 🇨🇳', isDefault: false, isActive: true },
    { code: 'fr', name: 'Français (Tiếng Pháp) 🇫🇷', isDefault: false, isActive: true }
];

class LanguageAdminController {
    // Lấy toàn bộ danh sách ngôn ngữ trong Admin
    static async getLanguages(req, res) {
        try {
            let languages = await Language.find().sort({ isDefault: -1, createdAt: 1 });
            
            // Nếu chưa có ngôn ngữ nào trong DB, tự động seed 6 ngôn ngữ chuẩn
            if (!languages || languages.length === 0) {
                await Language.insertMany(DEFAULT_LANGUAGES);
                languages = await Language.find().sort({ isDefault: -1, createdAt: 1 });
            }

            return res.json({ success: true, languages });
        } catch (err) {
            console.error("Lỗi getLanguages Admin:", err);
            return res.status(500).json({ error: "Lỗi lấy danh sách ngôn ngữ: " + err.message });
        }
    }

    // Thêm ngôn ngữ mới
    static async createLanguage(req, res) {
        try {
            const { code, name, isDefault, isActive } = req.body;
            if (!code || !name) {
                return res.status(400).json({ error: "Mã ngôn ngữ và Tên hiển thị là bắt buộc!" });
            }

            const existing = await Language.findOne({ code: code.trim().toLowerCase() });
            if (existing) {
                return res.status(400).json({ error: `Mã ngôn ngữ [${code}] đã tồn tại!` });
            }

            if (isDefault) {
                await Language.updateMany({}, { isDefault: false });
            }

            const newLang = await Language.create({
                code: code.trim().toLowerCase(),
                name: name.trim(),
                isDefault: !!isDefault,
                isActive: isActive !== undefined ? !!isActive : true
            });

            return res.status(201).json({ success: true, message: "Thêm ngôn ngữ thành công!", language: newLang });
        } catch (err) {
            return res.status(500).json({ error: "Lỗi thêm ngôn ngữ: " + err.message });
        }
    }

    // Cập nhật thông tin ngôn ngữ
    static async updateLanguage(req, res) {
        try {
            const { id } = req.params;
            const { code, name, isDefault, isActive } = req.body;

            const langDoc = await Language.findById(id);
            if (!langDoc) {
                return res.status(404).json({ error: "Không tìm thấy ngôn ngữ!" });
            }

            if (isDefault) {
                await Language.updateMany({}, { isDefault: false });
                langDoc.isDefault = true;
            } else if (isDefault === false) {
                langDoc.isDefault = false;
            }

            if (code) langDoc.code = code.trim().toLowerCase();
            if (name) langDoc.name = name.trim();
            if (isActive !== undefined) langDoc.isActive = !!isActive;

            await langDoc.save();
            return res.json({ success: true, message: "Cập nhật ngôn ngữ thành công!", language: langDoc });
        } catch (err) {
            return res.status(500).json({ error: "Lỗi cập nhật ngôn ngữ: " + err.message });
        }
    }

    // Xóa ngôn ngữ
    static async deleteLanguage(req, res) {
        try {
            const { id } = req.params;
            await Language.findByIdAndDelete(id);
            return res.json({ success: true, message: "Đã xóa ngôn ngữ thành công!" });
        } catch (err) {
            return res.status(500).json({ error: "Lỗi xóa ngôn ngữ: " + err.message });
        }
    }
}

module.exports = LanguageAdminController;
