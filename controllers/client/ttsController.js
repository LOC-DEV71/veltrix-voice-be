const { generateSpeechStream } = require('../../utils/ttsEngine');
const { uploadAudioBufferToCloudinary } = require('../../utils/cloudinary');
const AudioLog = require('../../models/audioLogModel');

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
            const { text, voice, rate, pitch } = req.body;
            const user = req.user;
            const charCount = text.length;

            const todayStr = new Date().toISOString().split('T')[0];

            // Tự động Reset Hạn Mức 2,000 ký tự vào lúc 00:00 hàng ngày
            if (user.lastDailyResetDate !== todayStr) {
                user.dailyTokensUsed = 0;
                user.tokens = user.dailyTokenLimit || 2000;
                user.lastDailyResetDate = todayStr;
            }

            const maxDaily = user.dailyTokenLimit || 2000;

            // Kiểm tra nếu vượt quá hạn mức 2,000 ký tự trong ngày
            if (user.dailyTokensUsed + charCount > maxDaily) {
                const remainingToday = Math.max(0, maxDaily - user.dailyTokensUsed);
                return res.status(400).json({ 
                    error: `⚠️ Bạn đã dùng vượt hạn mức ${maxDaily} ký tự/ngày! Hôm nay bạn chỉ còn ${remainingToday} ký tự. Hạn mức sẽ tự động làm mới 2,000 ký tự vào lúc 00:00 đêm nay.` 
                });
            }

            // Trừ token thực và lưu vào MongoDB Atlas
            user.dailyTokensUsed += charCount;
            user.tokens = Math.max(0, maxDaily - user.dailyTokensUsed);
            await user.save();

            // 1. Sinh Stream âm thanh từ TTS Engine
            const audioStream = await generateSpeechStream(text, voice, { rate, pitch });

            // 2. Gom Stream thành Buffer để upload Cloudinary
            const chunks = [];
            audioStream.on('data', (chunk) => chunks.push(chunk));
            
            audioStream.on('end', async () => {
                try {
                    const audioBuffer = Buffer.concat(chunks);
                    let cloudAudioUrl = '';

                    // Upload lên Cloudinary Cloud Storage
                    try {
                        cloudAudioUrl = await uploadAudioBufferToCloudinary(audioBuffer);
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
                        ipAddress: user.lastLoginIp || ''
                    });

                    // 4. Trả về stream âm thanh MP3 kèm Header thông tin
                    res.set({
                        'Content-Type': 'audio/mpeg',
                        'X-Remaining-Tokens': user.tokens,
                        'X-Audio-Url': cloudAudioUrl,
                        'X-Audio-Id': newAudioLog._id
                    });

                    return res.send(audioBuffer);
                } catch (saveErr) {
                    console.error("Lỗi lưu AudioLog DB:", saveErr);
                }
            });

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
}

module.exports = ClientTtsController;
