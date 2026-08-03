const { EdgeTTS } = require('node-edge-tts');
const googleTTS = require('google-tts-api');
const stream = require('stream');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

/**
 * Chia nhỏ văn bản theo câu / đoạn văn (tối đa ~250 ký tự/đoạn) để tránh WebSocket Timeout
 */
function splitTextIntoSentenceChunks(text, maxChunkLen = 250) {
    const cleanText = (text || '').replace(/\r\n/g, '\n').trim();
    if (!cleanText) return [];
    if (cleanText.length <= maxChunkLen) return [cleanText];

    const sentences = cleanText.split(/(?<=[.!?\n])\s+/);
    const chunks = [];
    let currentChunk = '';

    for (const sentence of sentences) {
        if (!sentence) continue;
        if ((currentChunk + ' ' + sentence).length <= maxChunkLen) {
            currentChunk = currentChunk ? currentChunk + ' ' + sentence : sentence;
        } else {
            if (currentChunk) chunks.push(currentChunk);
            if (sentence.length > maxChunkLen) {
                // Tách tiếp theo dấu phẩy nếu câu quá dài
                const subParts = sentence.split(/(?<=[,;])\s+/);
                let subChunk = '';
                for (const sub of subParts) {
                    if ((subChunk + ' ' + sub).length <= maxChunkLen) {
                        subChunk = subChunk ? subChunk + ' ' + sub : sub;
                    } else {
                        if (subChunk) chunks.push(subChunk);
                        subChunk = sub;
                    }
                }
                if (subChunk) currentChunk = subChunk;
                else currentChunk = '';
            } else {
                currentChunk = sentence;
            }
        }
    }
    if (currentChunk) chunks.push(currentChunk);
    return chunks.length > 0 ? chunks : [cleanText];
}

/**
 * Fetch Audio Buffer từ Google TTS Engine (dự phòng cấp 2 hỗ trợ văn bản dài vô tận)
 */
async function fetchGoogleTTSBuffer(text, language = 'vi') {
    const lang = language.startsWith('en') ? 'en' : 'vi';
    try {
        const base64List = await googleTTS.getAllAudioBase64(text, {
            lang,
            slow: false,
            host: 'https://translate.google.com',
            timeout: 8000,
        });
        const buffers = base64List.map(item => Buffer.from(item.base64, 'base64'));
        return Buffer.concat(buffers);
    } catch (err) {
        console.error("⚠️ [Google TTS Fallback] Lỗi:", err.message);
        throw err;
    }
}

/**
 * Sinh mp3 buffer cho 1 chunk duy nhất qua EdgeTTS kèm retry
 */
async function generateEdgeChunkBuffer(chunkText, voice, lang, options, scratchDir) {
    let rateString = '0%';
    if (options.rate !== undefined && options.rate !== 1) {
        const ratePercent = Math.round((options.rate - 1) * 100);
        rateString = ratePercent >= 0 ? `+${ratePercent}%` : `${ratePercent}%`;
    }

    let pitchString = '0Hz';
    if (options.pitch !== undefined && options.pitch !== '+0Hz' && options.pitch !== '0Hz') {
        if (typeof options.pitch === 'number') {
            pitchString = options.pitch >= 0 ? `+${options.pitch}Hz` : `${options.pitch}Hz`;
        } else if (typeof options.pitch === 'string') {
            let pStr = options.pitch.replace('Hz', '').trim();
            const pVal = parseInt(pStr);
            if (!isNaN(pVal)) {
                pitchString = pVal >= 0 ? `+${pVal}Hz` : `${pVal}Hz`;
            }
        }
    }

    // Thử lại 2 lần trước khi bỏ cuộc
    for (let attempt = 1; attempt <= 2; attempt++) {
        const tempFile = path.join(scratchDir, `tts_chunk_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.mp3`);
        try {
            const tts = new EdgeTTS({
                voice,
                lang,
                outputFormat: 'audio-24khz-96kbitrate-mono-mp3',
                rate: rateString,
                pitch: pitchString
            });

            await tts.ttsPromise(chunkText, tempFile);

            if (fs.existsSync(tempFile)) {
                const buf = fs.readFileSync(tempFile);
                try { fs.unlinkSync(tempFile); } catch(e) {}
                if (buf && buf.length > 0) return buf;
            }
        } catch (err) {
            try { if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile); } catch(e) {}
            if (attempt === 2) throw err;
            await new Promise(r => setTimeout(r, 300));
        }
    }
    throw new Error("EdgeTTS Chunk Failed after 2 attempts");
}

const { PollyClient, SynthesizeSpeechCommand } = require('@aws-sdk/client-polly');
const Setting = require('../models/settingModel');

async function getPollyClient() {
    let accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    let secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    let region = process.env.AWS_REGION || 'us-east-1';

    try {
        const dbSetting = await Setting.findOne();
        if (dbSetting && dbSetting.awsAccessKeyId && dbSetting.awsSecretAccessKey) {
            accessKeyId = dbSetting.awsAccessKeyId;
            secretAccessKey = dbSetting.awsSecretAccessKey;
            if (dbSetting.awsRegion) region = dbSetting.awsRegion;
        }
    } catch (e) {
        console.warn("⚠️ Không thể lấy AWS Setting từ DB:", e.message);
    }

    if (!accessKeyId || !secretAccessKey) {
        return null;
    }

    return new PollyClient({
        region,
        credentials: {
            accessKeyId,
            secretAccessKey
        }
    });
}

/**
 * Sinh âm thanh từ AWS Polly Engine
 */
async function generatePollySpeechBuffer(text, voiceId, options = {}) {
    const client = await getPollyClient();
    if (!client) {
        throw new Error("AWS Credentials chưa được cấu hình trong System Settings!");
    }

    const cleanVoiceId = voiceId.replace(/^(aws|polly)-/i, '');
    const neuralVoices = [
        'Joanna', 'Matthew', 'Ivy', 'Justin', 'Kendra', 'Kimberly', 'Salli', 'Joey', 
        'Ruth', 'Stephen', 'Amy', 'Brian', 'Emma', 'Olivia', 'Lupe', 'Pedro', 'Lucia', 
        'Zhiyu', 'Seoyeon', 'Kazuha', 'Takumi', 'Tomoko', 'Lea', 'Rémi', 'Vitoria', 'Camila'
    ];
    const isNeural = neuralVoices.includes(cleanVoiceId);

    const chunks = splitTextIntoSentenceChunks(text, 1500);
    const buffers = [];

    for (const chunk of chunks) {
        const commandParams = {
            Engine: isNeural ? 'neural' : 'standard',
            OutputFormat: 'mp3',
            Text: chunk,
            VoiceId: cleanVoiceId
        };

        const command = new SynthesizeSpeechCommand(commandParams);
        const response = await client.send(command);

        if (response.AudioStream) {
            const byteArray = await response.AudioStream.transformToByteArray();
            buffers.push(Buffer.from(byteArray));
        }
    }

    if (buffers.length === 0) {
        throw new Error("Không nhận được dữ liệu âm thanh từ AWS Polly");
    }

    return Buffer.concat(buffers);
}

/**
 * Smart Hybrid TTS Engine (Microsoft Neural, AWS Polly, Google TTS)
 */
/**
 * Smart Hybrid TTS Engine (Microsoft Neural, AWS Polly, Google TTS)
 */
async function generateSpeechBuffer(text, voice = 'vi-VN-HoaiMyNeural', options = {}) {
    // 💡 SỬA LỖI: Định nghĩa selectedVoice từ tham số voice truyền vào
    const selectedVoice = voice || 'vi-VN-HoaiMyNeural';

    // 0. Kiểm tra nếu là giọng AWS Polly (từ mã voiceId hoặc từ trường provider trong DB)
    let isAwsVoice = selectedVoice.toLowerCase().startsWith('aws-') || selectedVoice.toLowerCase().startsWith('polly-');
    if (!isAwsVoice) {
        try {
            const Voice = require('../models/voiceModel');
            const vObj = await Voice.findOne({ voiceId: selectedVoice });
            if (vObj && vObj.provider && vObj.provider.toLowerCase().includes('aws')) {
                isAwsVoice = true;
            }
        } catch (e) {}
    }

    if (isAwsVoice) {
        try {
            return await generatePollySpeechBuffer(text, selectedVoice, options);
        } catch (awsErr) {
            console.error("⚠️ [TTS Engine] AWS Polly Error:", awsErr.message);
            // Fallback sang Microsoft / Google nếu AWS gián đoạn
        }
    }

    const langParts = selectedVoice.split('-');
    const lang = langParts.length >= 2 ? `${langParts[0]}-${langParts[1]}` : 'vi-VN';

    const scratchDir = path.join(__dirname, '..', 'scratch');
    if (!fs.existsSync(scratchDir)) {
        fs.mkdirSync(scratchDir, { recursive: true });
    }

    // 1. Thử Microsoft Edge Neural TTS Engine theo từng đoạn câu
    try {
        const chunks = splitTextIntoSentenceChunks(text, 250);
        const buffers = [];
        for (const chunk of chunks) {
            const buf = await generateEdgeChunkBuffer(chunk, selectedVoice, lang, options, scratchDir);
            buffers.push(buf);
        }
        if (buffers.length > 0) {
            return Buffer.concat(buffers);
        }
    } catch (err) {
        console.warn(`⚠️ [TTS Engine] EdgeTTS Error (${err.message}). Chuyển sang Google TTS dự phòng...`);
    }

    // 2. Dự phòng Google TTS nếu gián đoạn mạng
    return await fetchGoogleTTSBuffer(text, lang);
}

/**
 * Trả về ReadableStream cho tương thích
 */
async function generateSpeechStream(text, voice = 'vi-VN-HoaiMyNeural', options = {}) {
    const buffer = await generateSpeechBuffer(text, voice, options);
    const readable = new stream.Readable();
    readable._read = () => {};
    readable.push(buffer);
    readable.push(null);
    return readable;
}

module.exports = {
    generateSpeechBuffer,
    generateSpeechStream,
    generatePollySpeechBuffer
};
