const Voice = require('../../models/voiceModel');
const { generateSpeechStream } = require('../../utils/ttsEngine');
const { uploadAudioBufferToCloudinary } = require('../../utils/cloudinary');

class VoiceAdminController {
    // 1. Get all voices
    static async getVoices(req, res) {
        try {
            const voices = await Voice.find().sort({ createdAt: -1 });
            return res.json({ success: true, voices });
        } catch (error) {
            console.error('Lỗi lấy danh sách giọng đọc:', error);
            return res.status(500).json({ error: 'Lỗi server khi lấy danh sách giọng đọc' });
        }
    }

    // 2. Create voice
    static async createVoice(req, res) {
        try {
            const newVoice = new Voice(req.body);
            await newVoice.save();
            return res.json({ success: true, voice: newVoice, message: 'Thêm giọng đọc thành công' });
        } catch (error) {
            console.error('Lỗi thêm giọng đọc:', error);
            return res.status(500).json({ error: 'Lỗi server khi thêm giọng đọc' });
        }
    }

    // 3. Update voice
    static async updateVoice(req, res) {
        try {
            const voiceId = req.params.id;
            const updatedVoice = await Voice.findByIdAndUpdate(voiceId, req.body, { new: true });
            if (!updatedVoice) {
                return res.status(404).json({ error: 'Không tìm thấy giọng đọc' });
            }
            return res.json({ success: true, voice: updatedVoice, message: 'Cập nhật giọng đọc thành công' });
        } catch (error) {
            console.error('Lỗi cập nhật giọng đọc:', error);
            return res.status(500).json({ error: 'Lỗi server khi cập nhật giọng đọc' });
        }
    }

    // 4. Delete voice
    static async deleteVoice(req, res) {
        try {
            const voiceId = req.params.id;
            const deletedVoice = await Voice.findByIdAndDelete(voiceId);
            if (!deletedVoice) {
                return res.status(404).json({ error: 'Không tìm thấy giọng đọc' });
            }
            return res.json({ success: true, message: 'Xóa giọng đọc thành công' });
        } catch (error) {
            console.error('Lỗi xóa giọng đọc:', error);
            return res.status(500).json({ error: 'Lỗi server khi xóa giọng đọc' });
        }
    }

    // 5. Tự động đọc sampleText của Voice -> Tạo MP3 và upload Cloudinary
    static async generateSampleAudio(req, res) {
        try {
            const { voiceId, text } = req.body;
            if (!text || !text.trim()) {
                return res.status(400).json({ error: 'Vui lòng nhập văn bản mẫu để AI đọc thử!' });
            }

            const stream = await generateSpeechStream(text, voiceId || 'vi-VN-HoaiMyNeural');
            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }
            const buffer = Buffer.concat(chunks);

            // Upload MP3 lên Cloudinary nhận link vĩnh viễn
            let audioUrl = '';
            try {
                audioUrl = await uploadAudioBufferToCloudinary(buffer);
            } catch (cloudErr) {
                console.warn('Lỗi Cloudinary (dùng Data URL dự phòng):', cloudErr.message);
                audioUrl = `data:audio/mp3;base64,${buffer.toString('base64')}`;
            }

            return res.json({ success: true, audioUrl, message: 'Tạo file âm thanh mẫu từ AI thành công!' });
        } catch (error) {
            console.error('Lỗi tạo audio mẫu:', error);
            return res.status(500).json({ error: 'Lỗi tạo audio mẫu từ AI: ' + error.message });
        }
    }
}

module.exports = VoiceAdminController;
