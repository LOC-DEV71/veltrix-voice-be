const Voice = require('../../models/voiceModel');
const { isVoiceLocked } = require('../../validators/voiceValidator');

class ClientVoiceController {
    static async getVoices(req, res) {
        try {
            const userTier = req.user ? (req.user.tier || 'FREE') : 'FREE';

            // Lấy giọng đọc ACTIVE từ MongoDB Atlas (dynamic, không hardcode)
            const voices = await Voice.find({ status: 'ACTIVE' }).sort({ createdAt: 1 });

            // Dùng Promise.all vì isVoiceLocked là async (query Plan hierarchy từ DB)
            const availableVoices = await Promise.all(
                voices.map(async (voice) => {
                    const reqRole = voice.requiredRole || 'FREE';

                    // Check quyền ĐỘNG dựa trên Plan.priority trong MongoDB
                    const locked = await isVoiceLocked(userTier, reqRole);

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
                        isLocked: locked
                    };
                })
            );

            return res.json({ voices: availableVoices });
        } catch (err) {
            console.error("Lỗi lấy danh sách giọng đọc:", err);
            return res.status(500).json({ error: "Lỗi tải danh sách giọng đọc: " + err.message });
        }
    }
}

module.exports = ClientVoiceController;
