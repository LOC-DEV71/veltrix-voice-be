const { generateSpeechBuffer, generateSpeechStream } = require('../../utils/ttsEngine');
const { uploadAudioBufferToCloudinary } = require('../../utils/cloudinary');
const AudioLog = require('../../models/audioLogModel');
const Folder = require('../../models/folderModel');

const mongoose = require('mongoose');

class ClientTtsController {
    // Nghe thử giọng đọc — CHỈ phát audio mẫu, KHÔNG trừ token, KHÔNG lưu lịch sử
    static async preview(req, res) {
        try {
            const { text, voice, rate, pitch } = req.body;

            // Giới hạn mẫu nghe thử tối đa 200 ký tự để tránh lạm dụng
            const sampleText = (text || '').slice(0, 200);
            if (!sampleText || !voice) {
                return res.status(400).json({ error: 'Thiếu text hoặc voice' });
            }

            const audioStream = await generateSpeechStream(sampleText, voice, { rate, pitch });

            res.set({ 'Content-Type': 'audio/mpeg' });
            audioStream.pipe(res);
        } catch (err) {
            console.error("Preview TTS Error:", err);
            if (!res.headersSent) {
                res.status(500).json({ error: "Lỗi nghe thử: " + err.message });
            }
        }
    }

    static async generate(req, res) {
        try {
            const { text, voice, rate, pitch, title, folder } = req.body;
            const user = req.user;

            if (!text || typeof text !== 'string' || text.trim().length === 0) {
                return res.status(400).json({ error: 'Vui lòng nhập văn bản cần tạo giọng đọc!' });
            }

            const charCount = text.length;
            const maxChars = user.maxCharsPerRequest || 1000;

            if (charCount > maxChars) {
                return res.status(400).json({ 
                    error: `⚠️ Đoạn văn của bạn có ${charCount.toLocaleString()} ký tự, vượt quá giới hạn tối đa ${maxChars.toLocaleString()} ký tự/lượt cho gói hiện tại!` 
                });
            }

            const todayStr = new Date().toISOString().split('T')[0];
            const maxDaily = user.dailyTokenLimit || 2000;

            // Tự động Reset Hạn Mức khi sang ngày mới (00:00)
            if (user.lastDailyResetDate !== todayStr) {
                user.dailyTokensUsed = 0;
                user.tokens = maxDaily;
                user.lastDailyResetDate = todayStr;
            }

            // 1. Kiểm tra số dư token còn lại
            if (user.tokens < charCount) {
                return res.status(400).json({
                    error: `⚠️ Số dư Token không đủ! Bạn cần ${charCount.toLocaleString()} token nhưng chỉ còn ${(user.tokens || 0).toLocaleString()} token. Vui lòng nạp thêm.`
                });
            }

            // 2. Kiểm tra giới hạn dùng trong ngày
            if (user.dailyTokensUsed + charCount > maxDaily) {
                const remainingToday = Math.max(0, maxDaily - user.dailyTokensUsed);
                return res.status(400).json({ 
                    error: `⚠️ Bạn đã dùng vượt hạn mức ${maxDaily.toLocaleString()} ký tự/ngày! Hôm nay bạn chỉ còn ${remainingToday.toLocaleString()} ký tự. Hạn mức sẽ tự động làm mới vào 00:00 đêm nay.` 
                });
            }

            // Trừ token thực và lưu vào MongoDB Atlas
            user.dailyTokensUsed += charCount;
            user.tokens = Math.max(0, user.tokens - charCount);
            await user.save();

            // 1. Sinh âm thanh siêu tốc từ Smart Hybrid TTS Engine (0.7s - 1.2s)
            const audioBuffer = await generateSpeechBuffer(text, voice, { rate, pitch });

            // 2. Upload Cloudinary kèm Timeout 3.5s chống nghẽn đường truyền
            let cloudAudioUrl = '';
            try {
                const cloudPromise = uploadAudioBufferToCloudinary(audioBuffer);
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Cloudinary Timeout (3.5s)')), 3500)
                );
                cloudAudioUrl = await Promise.race([cloudPromise, timeoutPromise]);
            } catch (cloudErr) {
                console.error("Lỗi Upload Cloudinary:", cloudErr.message);
            }

            // 3. Lưu lịch sử tạo Audio thực vào Bảng AudioLog MongoDB Atlas
            const newAudioLog = await AudioLog.create({
                user: user._id,
                text,
                voiceId: voice,
                audioUrl: cloudAudioUrl,
                charactersCount: charCount,
                tokensDeducted: charCount,
                ipAddress: user.lastLoginIp || '',
                title: title && title.trim() ? title.trim() : '',
                folder: folder && folder.trim() ? folder.trim() : 'Mặc định'
            });

            // 4. Trả về MP3 Buffer ngay lập tức cho client
            res.set({
                'Content-Type': 'audio/mpeg',
                'X-Remaining-Tokens': user.tokens,
                'X-Audio-Url': cloudAudioUrl,
                'X-Audio-Id': newAudioLog._id
            });

            return res.send(audioBuffer);
        } catch (err) {
            console.error("Client TTS Generation Error:", err);
            if (!res.headersSent) {
                res.status(500).json({ error: "Lỗi phát sinh từ hệ thống TTS: " + err.message });
            }
        }
    }

    // Lấy lịch sử tạo âm thanh thực từ MongoDB Atlas
    static async getHistory(req, res) {
        try {
            const logs = await AudioLog.find({ user: req.user._id })
                .sort({ createdAt: -1 })
                .limit(50);
            
            return res.json({ history: logs });
        } catch (err) {
            return res.status(500).json({ error: "Lỗi lấy lịch sử audio: " + err.message });
        }
    }

    // Xóa bài đọc khỏi CSDL MongoDB Atlas
    static async deleteHistory(req, res) {
        try {
            const { id } = req.params;
            await AudioLog.findOneAndDelete({ _id: id, user: req.user._id });
            return res.json({ success: true, message: "Đã xóa bài đọc thành công" });
        } catch (err) {
            return res.status(500).json({ error: "Lỗi xóa bài đọc: " + err.message });
        }
    }

    // Lấy danh sách Thư mục dự án của người dùng
    static async getFolders(req, res) {
        try {
            const folders = await Folder.find({ user: req.user._id }).sort({ name: 1 });
            return res.json({ folders });
        } catch (err) {
            return res.status(500).json({ error: "Lỗi lấy danh sách thư mục: " + err.message });
        }
    }

    // Tạo thư mục dự án mới
    static async createFolder(req, res) {
        try {
            const { name, color } = req.body;
            if (!name || !name.trim()) {
                return res.status(400).json({ error: "Vui lòng nhập tên thư mục!" });
            }
            const existing = await Folder.findOne({ user: req.user._id, name: name.trim() });
            if (existing) {
                return res.status(400).json({ error: "Thư mục này đã tồn tại!" });
            }
            const newFolder = await Folder.create({
                user: req.user._id,
                name: name.trim(),
                color: color || '#8b5cf6'
            });
            return res.status(201).json({ folder: newFolder, message: "Tạo thư mục thành công!" });
        } catch (err) {
            return res.status(500).json({ error: "Lỗi tạo thư mục: " + err.message });
        }
    }

    // Xóa thư mục dự án
    static async deleteFolder(req, res) {
        try {
            const { id } = req.params;
            if (mongoose.Types.ObjectId.isValid(id)) {
                await Folder.findOneAndDelete({ _id: id, user: req.user._id });
            } else {
                await Folder.findOneAndDelete({ name: decodeURIComponent(id), user: req.user._id });
            }
            return res.json({ success: true, message: "Đã xóa thư mục thành công!" });
        } catch (err) {
            return res.status(500).json({ error: "Lỗi xóa thư mục: " + err.message });
        }
    }
}

module.exports = ClientTtsController;
