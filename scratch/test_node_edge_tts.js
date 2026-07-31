const { EdgeTTS } = require('node-edge-tts');
const fs = require('fs');

async function testNodeEdgeTTS() {
    console.log('⏱️ Testing node-edge-tts (v1.2.10) with Microsoft Neural Voices...');
    const startTime = Date.now();

    const voicesToTest = [
        { voice: 'vi-VN-HoaiMyNeural', name: 'Hoài My (Nữ Việt Nam)' },
        { voice: 'vi-VN-NamMinhNeural', name: 'Nam Minh (Nam Việt Nam)' },
        { voice: 'en-US-AvaNeural', name: 'Ava (Nữ Mỹ)' },
        { voice: 'en-US-AndrewNeural', name: 'Andrew (Nam Mỹ)' }
    ];

    for (const v of voicesToTest) {
        const startVoice = Date.now();
        try {
            const tts = new EdgeTTS({
                voice: v.voice,
                lang: v.voice.split('-')[0] + '-' + v.voice.split('-')[1],
                outputFormat: 'audio-24khz-96kbitrate-mono-mp3'
            });

            await tts.ttsPromise(`Xin chào! Tôi là giọng đọc ${v.name} chuẩn Microsoft Neural AI.`, './scratch/temp.mp3');
            const buffer = fs.readFileSync('./scratch/temp.mp3');
            console.log(`✅ [${v.name}] SUCCESS! Audio Buffer size: ${buffer.length} bytes in ${Date.now() - startVoice}ms!`);
        } catch(e) {
            console.error(`❌ [${v.name}] Failed:`, e.message);
        }
    }

    console.log(`\n🎉 TOTAL TEST TIME: ${Date.now() - startTime}ms`);
    process.exit();
}

testNodeEdgeTTS();
