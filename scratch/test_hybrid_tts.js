require('dotenv').config();
const { generateSpeechBuffer } = require('../utils/ttsEngine');

async function testHybrid() {
    console.log('⏱️ Testing Hybrid TTS Engine (EdgeTTS -> Google TTS Fallback)...');
    const startTime = Date.now();

    try {
        const buffer = await generateSpeechBuffer("Xin chào! Đây là ứng dụng tạo giọng nói trí tuệ nhân tạo được xây dựng với chuẩn kiến trúc Redux Toolkit và MVC.");
        console.log(`🎉 HYBRID SUCCESS! Buffer size: ${buffer.length} bytes in ${Date.now() - startTime}ms!`);
    } catch(err) {
        console.error('❌ Hybrid Error:', err);
    }
    process.exit();
}

testHybrid();
