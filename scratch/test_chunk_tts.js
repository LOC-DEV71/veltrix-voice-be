const { EdgeTTS } = require('node-edge-tts');
const googleTTS = require('google-tts-api');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

function splitTextIntoSentenceChunks(text, maxChunkLen = 250) {
    const cleanText = text.replace(/\r\n/g, '\n').trim();
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
    return chunks;
}

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
        console.error("Google TTS Error:", err.message);
        throw err;
    }
}

async function generateEdgeChunkBuffer(chunkText, voice, lang, options, scratchDir) {
    const tempFile = path.join(scratchDir, `tts_chunk_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.mp3`);
    
    let rateString = '0%';
    if (options.rate !== undefined && options.rate !== 1) {
        const ratePercent = Math.round((options.rate - 1) * 100);
        rateString = ratePercent >= 0 ? `+${ratePercent}%` : `${ratePercent}%`;
    }

    let pitchString = '0Hz';
    if (options.pitch !== undefined && options.pitch !== '+0Hz') {
        pitchString = options.pitch;
    }

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
        return buf;
    }
    throw new Error("Không thể tạo file chunk tạm");
}

async function testSequentialTTS() {
    const text = `Pin cũng là điểm ấn tượng. Nếu bạn là người dùng cơ bản thì không phải lo hết pin. Nếu bạn là người dùng tác vụ nặng liên tục trên điện thoại thì chiếc máy này đáp ứng rất tốt.

Vậy có đáng nâng cấp hay không? Nếu bạn đang dùng 11, 12, 13 hoặc muốn trải nghiệm màn hình tần số quét cao thì nâng cấp rất đáng cân nhắc. Còn nếu đang dùng 14 Pro trở lên thì chưa thực sự cần thiết.

Còn mọi người thì sao? Mọi người chọn nâng cấp hay tiếp tục gắn bó với chiếc điện thoại hiện tại? Bình luận bên dưới để mình biết với nhé!`;

    console.log("⏱️ Testing Sequential EdgeTTS for text length:", text.length);
    const chunks = splitTextIntoSentenceChunks(text, 250);
    const scratchDir = path.join(__dirname, 'scratch_test');
    if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });

    try {
        const startTime = Date.now();
        const buffers = [];
        for (const chunk of chunks) {
            const buf = await generateEdgeChunkBuffer(chunk, 'vi-VN-HoaiMyNeural', 'vi-VN', {}, scratchDir);
            buffers.push(buf);
        }
        const finalBuffer = Buffer.concat(buffers);
        console.log(`🎉 SUCCESS EdgeTTS Sequential! Size: ${finalBuffer.length} bytes in ${Date.now() - startTime}ms!`);
    } catch (err) {
        console.error("FAIL EdgeTTS:", err.message);
    }
}

testSequentialTTS();
