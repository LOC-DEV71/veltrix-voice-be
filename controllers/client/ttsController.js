const { generateSpeechBuffer, generateSpeechStream } = require('../../utils/ttsEngine');
const { uploadAudioBufferToCloudinary } = require('../../utils/cloudinary');
const AudioLog = require('../../models/audioLogModel');
const Folder = require('../../models/folderModel');

const mongoose = require('mongoose');

class ClientTtsController {
    // Nghe thử giọng đọc — CHỈ phát audio mẫu, KHÔNG trừ token, KHÔNG lưu lịch sử
    static async preview(req, res) {
        try {
            const { text, voice: rawVoice, voiceId, rate, pitch } = req.body;
            const voice = rawVoice || voiceId || 'vi-VN-HoaiMyNeural';

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
            const { text, voice: rawVoice, voiceId, rate, pitch, title, folder } = req.body;
            const voice = rawVoice || voiceId || 'vi-VN-HoaiMyNeural';
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

            // 2. Upload Cloudinary kèm Timeout 12s
            let cloudAudioUrl = '';
            try {
                const cloudPromise = uploadAudioBufferToCloudinary(audioBuffer);
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Cloudinary Timeout (12s)')), 12000)
                );
                cloudAudioUrl = await Promise.race([cloudPromise, timeoutPromise]);
            } catch (cloudErr) {
                console.error("Lỗi Upload Cloudinary:", cloudErr.message);
            }

            // 3. Lưu lịch sử tạo Audio thực vào Bảng AudioLog MongoDB Atlas
            const newAudioLog = new AudioLog({
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

            // Nếu Cloudinary bị chậm hoặc chưa có URL, đặt fallback URL stream tức thì
            if (!cloudAudioUrl) {
                newAudioLog.audioUrl = `/api/client/tts/history/stream/${newAudioLog._id}`;
            }

            await newAudioLog.save();

            // Nếu là cuộc gọi từ SDK API hoặc Yêu cầu JSON, trả về object JSON chứa audioUrl và Token còn lại
            if (req.isSdkCall || req.headers['accept']?.includes('application/json') || req.query.responseType === 'json') {
                return res.json({
                    success: true,
                    audioUrl: newAudioLog.audioUrl,
                    remainingTokens: user.tokens,
                    audioId: newAudioLog._id
                });
            }

            // 4. Trả về MP3 Buffer ngay lập tức cho client Studio
            res.set({
                'Content-Type': 'audio/mpeg',
                'X-Remaining-Tokens': user.tokens,
                'X-Audio-Url': newAudioLog.audioUrl,
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

            // Đảm bảo bài đọc nào cũng có audioUrl hợp lệ (nếu rỗng thì gán link stream fallback)
            const sanitizedLogs = logs.map(log => {
                const item = log.toObject();
                if (!item.audioUrl) {
                    item.audioUrl = `/api/client/tts/history/stream/${item._id}`;
                }
                return item;
            });
            
            return res.json({ history: sanitizedLogs });
        } catch (err) {
            return res.status(500).json({ error: "Lỗi lấy lịch sử audio: " + err.message });
        }
    }

    // Phát lại âm thanh từ Lịch sử (Stream Fallback nếu mất link Cloudinary)
    static async streamHistoryAudio(req, res) {
        try {
            const { id } = req.params;
            const log = await AudioLog.findById(id);
            if (!log) {
                return res.status(404).json({ error: "Không tìm thấy bài đọc!" });
            }

            // Nếu đã có Cloudinary URL thật, redirect trực tiếp
            if (log.audioUrl && log.audioUrl.startsWith('http')) {
                return res.redirect(log.audioUrl);
            }

            // Fallback: Sinh lại audio stream tức thì từ text & voiceId trong DB
            const audioStream = await generateSpeechStream(log.text, log.voiceId);
            res.set({ 'Content-Type': 'audio/mpeg' });
            audioStream.pipe(res);

            // Tự động upload Cloudinary ngầm để lần sau phát tức thì
            generateSpeechBuffer(log.text, log.voiceId)
                .then(buf => uploadAudioBufferToCloudinary(buf))
                .then(url => {
                    if (url) {
                        log.audioUrl = url;
                        log.save();
                    }
                })
                .catch(e => console.error("Ngầm upload Cloudinary thất bại:", e.message));
        } catch (err) {
            console.error("Stream History Audio Error:", err);
            if (!res.headersSent) {
                res.status(500).json({ error: "Lỗi phát lại audio: " + err.message });
            }
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

    // Cập nhật Thư mục cho Bài đọc (Di chuyển thư mục)
    static async updateAudioFolder(req, res) {
        try {
            const { id } = req.params;
            const { folder } = req.body;

            const log = await AudioLog.findOne({ _id: id, user: req.user._id });
            if (!log) {
                return res.status(404).json({ error: "Không tìm thấy bài đọc!" });
            }

            log.folder = folder && folder.trim() ? folder.trim() : 'Mặc định';
            await log.save();

            return res.json({ success: true, message: `Đã chuyển bài đọc sang thư mục "${log.folder}"`, log });
        } catch (err) {
            return res.status(500).json({ error: "Lỗi chuyển thư mục: " + err.message });
        }
    }

    // Cập nhật Tiêu đề cho Bài đọc (Đổi tên file/dự án)
    static async updateAudioTitle(req, res) {
        try {
            const { id } = req.params;
            const { title } = req.body;

            const log = await AudioLog.findOne({ _id: id, user: req.user._id });
            if (!log) {
                return res.status(404).json({ error: "Không tìm thấy bài đọc!" });
            }

            log.title = title ? title.trim() : '';
            await log.save();

            return res.json({ success: true, message: `Đã đổi tên bài đọc thành "${log.title}"`, log });
        } catch (err) {
            return res.status(500).json({ error: "Lỗi đổi tên bài đọc: " + err.message });
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
