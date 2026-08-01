const { EdgeTTS } = require('node-edge-tts');
const path = require('path');
const fs = require('fs');

async function testOptions() {
    const scratchDir = path.join(__dirname, 'test_scratch');
    if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir);

    const testCases = [
        { voice: 'vi-VN-HoaiMyNeural', options: { rate: 1, pitch: '+0Hz' } },
        { voice: 'vi-VN-HoaiMyNeural', options: { rate: 1.2, pitch: '+10Hz' } },
        { voice: 'vi-VN-NamMinhNeural', options: { rate: 1, pitch: '0Hz' } },
        { voice: 'vi-VN-HoaiMyNeural', options: { rate: 0.8, pitch: '-10Hz' } },
    ];

    for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        console.log(`\n🧪 Test Case ${i + 1}: voice=${tc.voice}, options=`, tc.options);

        let rateString = '0%';
        if (tc.options.rate !== undefined && tc.options.rate !== 1) {
            const ratePercent = Math.round((tc.options.rate - 1) * 100);
            rateString = ratePercent >= 0 ? `+${ratePercent}%` : `${ratePercent}%`;
        }

        let pitchString = '0Hz';
        if (tc.options.pitch !== undefined && tc.options.pitch !== '+0Hz' && tc.options.pitch !== '0Hz') {
            pitchString = tc.options.pitch;
        }

        console.log(`   -> rateString="${rateString}", pitchString="${pitchString}"`);

        try {
            const tempFile = path.join(scratchDir, `test_${i}.mp3`);
            const tts = new EdgeTTS({
                voice: tc.voice,
                lang: tc.voice.split('-').slice(0, 2).join('-'),
                outputFormat: 'audio-24khz-96kbitrate-mono-mp3',
                rate: rateString,
                pitch: pitchString
            });

            await tts.ttsPromise("Xin chào đây là bài test giọng đọc thử nghiệm.", tempFile);
            console.log(`   ✅ SUCCESS! MP3 size: ${fs.statSync(tempFile).size} bytes`);
            fs.unlinkSync(tempFile);
        } catch (err) {
            console.error(`   ❌ FAIL EdgeTTS:`, err.message || err);
        }
    }
}

testOptions();
