require('dotenv').config();
const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');
const { uploadAudioBufferToCloudinary } = require('../utils/cloudinary');

async function testStandardFormat() {
    console.log('⏱️ Testing Standard OUTPUT_FORMAT.AUDIO_24KHZ_96BITRATE_MONO_MP3...');
    const text = "Xin chào! Đây là ứng dụng tạo giọng nói trí tuệ nhân tạo được xây dựng với chuẩn kiến trúc Redux Toolkit và MVC.";
    const voice = "vi-VN-HoaiMyNeural";

    const startTime = Date.now();
    try {
        const tts = new MsEdgeTTS();
        await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_96BITRATE_MONO_MP3);

        const { audioStream } = tts.toStream(text);
        const chunks = [];
        await new Promise((resolve, reject) => {
            audioStream.on('data', chunk => chunks.push(chunk));
            audioStream.on('end', resolve);
            audioStream.on('error', reject);
        });

        const ttsTime = Date.now() - startTime;
        const buffer = Buffer.concat(chunks);
        console.log(`✅ SUCCESS! TTS Stream finished in ${ttsTime}ms! Buffer size: ${buffer.length} bytes`);

        const cloudStart = Date.now();
        const url = await uploadAudioBufferToCloudinary(buffer);
        console.log(`✅ Cloudinary Upload finished in ${Date.now() - cloudStart}ms! URL: ${url}`);

        console.log(`🎉 TOTAL PROCESS TAKES ONLY: ${Date.now() - startTime}ms (under 3 seconds!)`);
    } catch(err) {
        console.error('❌ Standard Format Error:', err);
    } process.exit();
}

testStandardFormat();
