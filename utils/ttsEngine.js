const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');

/**
 * Thư viện wrapper cho MS Edge TTS
 * @param {string} text - Văn bản cần chuyển thành giọng nói
 * @param {string} voice - ID giọng đọc (ví dụ: vi-VN-HoaiMyNeural)
 * @param {object} options - Tùy chọn prosody { rate, pitch }
 * @param {number} options.rate - Tốc độ đọc (0.5 - 2.0, mặc định 1.0)
 * @param {string} options.pitch - Độ cao giọng (ví dụ: '+0Hz', '+50Hz', '-20Hz')
 */
async function generateSpeechStream(text, voice = 'vi-VN-HoaiMyNeural', options = {}) {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);

    const prosody = {};
    if (options.rate !== undefined && options.rate !== 1) {
        const ratePercent = Math.round((options.rate - 1) * 100);
        prosody.rate = ratePercent >= 0 ? `+${ratePercent}%` : `${ratePercent}%`;
    }
    if (options.pitch !== undefined && options.pitch !== '+0Hz') {
        prosody.pitch = options.pitch;
    }

    const { audioStream } = tts.toStream(text, Object.keys(prosody).length > 0 ? prosody : undefined);
    return audioStream;
}

module.exports = {
    generateSpeechStream
};
