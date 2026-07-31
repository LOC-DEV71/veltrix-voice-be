const { EdgeTTS } = require('edge-tts-node');

async function testEdgeTTSNode() {
    console.log('⏱️ Testing edge-tts-node with Microsoft Neural Voices...');
    const startTime = Date.now();
    try {
        const tts = new EdgeTTS({
            voice: 'vi-VN-HoaiMyNeural',
            lang: 'vi-VN',
            outputFormat: 'audio-24khz-96kbitrate-mono-mp3'
        });

        const text = "Xin chào! Đây là giọng đọc Hoài My chuẩn Microsoft Neural HD.";
        const buffer = await tts.generateBuffer(text);

        console.log(`✅ SUCCESS! Buffer size: ${buffer.length} bytes in ${Date.now() - startTime}ms!`);
    } catch(e) {
        console.error('❌ EdgeTTSNode Error:', e);
    }
    process.exit();
}

testEdgeTTSNode();
