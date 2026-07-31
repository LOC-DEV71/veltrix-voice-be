const { MsEdgeTTS, OUTPUT_FORMAT } = require('edge-tts-node');

async function testEdgeTTSNodeReal() {
    console.log('⏱️ Testing MsEdgeTTS from edge-tts-node...');
    const startTime = Date.now();
    try {
        const tts = new MsEdgeTTS();
        await tts.setMetadata('vi-VN-HoaiMyNeural', OUTPUT_FORMAT.AUDIO_24KHZ_96BITRATE_MONO_MP3);
        const { audioStream } = tts.toStream('Xin chào! Đây là giọng đọc Hoài My chuẩn Microsoft Neural HD.');

        const chunks = [];
        await new Promise((resolve, reject) => {
            audioStream.on('data', c => chunks.push(c));
            audioStream.on('end', resolve);
            audioStream.on('error', reject);
        });

        const buffer = Buffer.concat(chunks);
        console.log(`✅ SUCCESS! Microsoft Neural Voice Buffer size: ${buffer.length} bytes in ${Date.now() - startTime}ms!`);
    } catch(e) {
        console.error('❌ Error:', e);
    }
    process.exit();
}

testEdgeTTSNodeReal();
