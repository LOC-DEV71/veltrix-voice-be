const Voice = require('../../models/voiceModel');

class ClientVoiceController {
    static async getVoices(req, res) {
        try {
            const userTier = req.user ? (req.user.tier || 'FREE') : 'FREE';

            // Lấy giọng đọc ACTIVE từ MongoDB Atlas (dynamic, không hardcode)
            const voices = await Voice.find({ status: 'ACTIVE' }).sort({ createdAt: 1 });

            const availableVoices = voices.map(voice => {
                const reqRole = voice.requiredRole || 'FREE';
                const isFreeVoice = reqRole === 'FREE' || reqRole === 'ROLE_USER';

                // Trạng thái khóa/mở giọng đọc dựa theo Hạng tài khoản của User
                let isLocked = false;
                if (!isFreeVoice) {
                    if (userTier === 'FREE') {
                        isLocked = true;
                    } else if (reqRole !== 'FREE' && userTier !== reqRole && userTier !== 'PRO' && userTier !== 'VIP') {
                        isLocked = true;
                    }
                }

                return {
                    id: voice.voiceId,
                    name: voice.name,
                    gender: voice.gender,
                    region: voice.region,
                    language: voice.language,
                    provider: voice.provider,
                    badge: voice.badge,
                    desc: voice.desc,
                    sampleText: voice.sampleText || 'Xin chào, đây là giọng đọc thử nghiệm của tôi trên Veltrix Voice.',
                    sampleAudioUrl: voice.sampleAudioUrl || '',
                    requiredRole: reqRole,
                    isLocked
                };
            });

            return res.json({ voices: availableVoices });
        } catch (err) {
            console.error("Lỗi lấy danh sách giọng đọc:", err);
            return res.status(500).json({ error: "Lỗi tải danh sách giọng đọc: " + err.message });
        }
    }
}

module.exports = ClientVoiceController;
